/**
 * Created by Jazz on 7/23/14.
 */
(function(){
    var mongoClient = require('mongodb').MongoClient
    var socketclient = require('socket.io').listen(8080).sockets;

    mongoClient.connect('mongodb://127.0.0.1/chat',function(err,db){
        if(err) throw err;


        //When Connection is established
        socketclient.on("connection",function(socket){

            //Collection (table) is created on database Chat
            var dbCollection = db.collection("messages");
            var dbCollectionOnline = db.collection("onlineusers");

            var sendMessage = function(s){
                socket.emit('sendMessage',s);
            }
            var updateOnlineUserList=function(){
                dbCollectionOnline.find().sort({_id:1}).toArray(function(err,data){
                    if(err) throw err;

                    socketclient.emit('sendOnlineUsersList',data);
                });
            }

            //Read Online Users
            socket.on('getOnlineUsers',function(){
                updateOnlineUserList();
            });

            //Emit All messages to users
            dbCollection.find().sort({_id:1}).toArray(function(err,data){
                //Throw exception
                if(err) throw err;

                socket.emit('showMessageInChat',data);

            });

            //Listen saveOnlineUser socket
            socket.on('saveOnlineUser',function(id){

                //Check if online user is already in database
                dbCollectionOnline.find( { id: id }).toArray(function(err,data){

                 if(data.length==0){
                     dbCollectionOnline.insert({id:id},function(){
                     });
                 }

                });
            });

            // Listen When Message is sent
            socket.on('saveMessageToDataBase',function(data){
                var strName = data.name;
                var strMessage = data.message;

                dbCollection.insert({name: strName, message: strMessage},function(){

                    //use socketclient instead of socket, as we need to send chat to all clients.
                    socketclient.emit('showMessageInChat',[data]);

                    sendMessage({
                        message: 'Data Saved',
                        clear:true
                    });
                });
            });


            //when Connection is closed for the user
            socket.on('setUserOffline', function (id) {
               dbCollectionOnline.remove({id:id},function(){
                   updateOnlineUserList();
               });
            });


        });
    });
})();




