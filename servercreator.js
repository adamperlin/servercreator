var app = require('http').createServer(callback)
var io = require('socket.io')(app);
var fs = require('fs');

//fs reader callback, reads and serves data from html file
function callback(req,res){
  var port = ServerCreator.configObj.port;
  var pagename = ServerCreator.configObj.pagename;
      fs.readFile(__dirname + '/' + pagename,(err, data)=> {
          if (err) {
              res.writeHead(500);
              return res.end('Error loading ' + pagename);
          }
          res.writeHead(200);
          res.end(data);
  });
}
//Server Creator object to store functions to create a socket.io http server
var ServerCreator = {
      "configObj":{},
      //initiailize: parse config file
      init: function(){
        console.log("beginning callback chain");
        fs.readFile("module.json",(err,data)=>{
          if(!err){
            this.configObj =  JSON.parse(data);
            console.log(this.configObj);
            this.pageNameParser();
            console.log("file read successfully")
          }else {
            console.log(err.stack);
          }
        });
      },
      //create http server
      createHttpServer: function (){
        app.listen(this.configObj.port);
        console.log("listening on %s", this.configObj.port);
        this.createConnectionHandler();
      },
      //parse page name, then proceed to create http server
      pageNameParser: function (){
        var pagename = this.configObj.pagename;
        var n = pagename.lastIndexOf('/');
        var pagename = pagename.substring(n + 1);
        pagename = pagename.replace(".js", ".html");
        this.configObj.pagename = pagename;
        this.createHttpServer();
      },
      //make a connection handler for the event specified in the config file
     createConnectionHandler: function(){
       console.log("creating Connection handler");
        io.on("connection", function(socket) {
          console.log("got connection");
          socket.on(ServerCreator.configObj.event,()=>{
            console.log('got event');
            var response = {};
            response.data = "default response";
            socket.emit('response', response);
          });
        });
    }
}
var createServer= function(){
  ServerCreator.init();
}
exports.createServer = createServer;
