/**
 * Created by Jazz on 7/24/14.
 */

(function(){

    //Make Connection to Socket
    try{
        socket = io.connect('http://127.0.0.1:8080');
    }
    catch (e){

    }

    var getNode = function(s){
        return document.querySelector(s);
    };

    var objTextBoxName = getNode('.chat-username');
    var objTextAreaMessage = getNode('.chat-message-submit');
    var objChatStatus = getNode('.chat-status span');
    var objChatMessages = getNode('.chat-messages');
    var socket;
    var defaultStatus = objChatStatus.textContent;
    var objFriendList = getNode('.friend-list ul');

    var setStatus= function(s){
        objChatStatus.textContent = s;

        if(s!=defaultStatus){
            var delay = setTimeout(function(){
                setStatus(defaultStatus);
                clearInterval(delay);
            },3000);
        }
    };


    var getQueryString = function(key)
    {
        // Find the key and everything up to the ampersand delimiter
        var value=RegExp(""+key+"[^&]+").exec(window.location.search);

        // Return the unescaped value minus everything starting from the equals sign or an empty string
        return unescape(!!value ? value.toString().replace(/^[^=]+./,"") : "");
    }

    //Load User Related Data
    objTextBoxName.value = prompt("Please enter your name", "User Name");//getQueryString('user');

    if(socket!=undefined){
        //Set online user in database
        socket.emit('saveOnlineUser',objTextBoxName.value);

        //Listen to SendMessage socket
        socket.on('sendMessage',function(data){
            setStatus((typeof data === 'object')? data.message:data);

            if(data.clear===true){
                objTextAreaMessage.value='';
            }
        });

        //Listen to send MessagesInChat
        socket.on('showMessageInChat',function(data){
            if(data.length>0){
                for(var i = 0; i < data.length ; i++){

                    var message = document.createElement('div');
                    message.setAttribute('class','chat-message');
                    message.textContent =data[i].name +': '+ data[i].message ;

                    objChatMessages.appendChild(message);
                }

                objChatMessages.scrollTop = objChatMessages.scrollHeight;
            }
        });

        //Get Online Users
        socket.emit('getOnlineUsers');

        //Listen sendOnlineUsersList from socket
        socket.on('sendOnlineUsersList',function(data){
            if(data.length>0){
                objFriendList.innerHTML='';
                for(var i=0; i<data.length;i++){

                    //Do not show current user's name in chat list
                    if(data[i].id == objTextBoxName.value){continue};

                    var userli = document.createElement('li');
                    var userli_a = document.createElement('a');
                    userli_a.textContent = data[i].id;
                    userli_a.setAttribute('data-id',data[i].id);

                    //Open chat window
                    userli_a.addEventListener('click',function(e){
                        console.log(this.getAttribute('data-id'));
                    });

                    userli.appendChild(userli_a);


                    objFriendList.appendChild(userli);
                }
            }
        });

        objTextAreaMessage.addEventListener('keydown',function(e){
            if(e.which === 13 && e.shiftKey===false){
                socket.emit('saveMessageToDataBase',{
                    name : objTextBoxName.value,
                    message: objTextAreaMessage.value
                });

                e.preventDefault();
            }
        });

        //Open Chat Window on chat link click


        window.onbeforeunload = function(e) {
            socket.emit('setUserOffline',objTextBoxName.value);
        }
    }
})();

