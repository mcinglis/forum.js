// A basic forum server.

'use strict';

var express  = require( 'express' );
var mongoose = require( 'mongoose' );

var app = express();

mongoose.connect( 'mongodb://localhost/forum' );

app.set( 'port', 3000 );

app.use( express.bodyParser() );
app.use( express.methodOverride() );

var Thread = mongoose.model( 'Thread', {
    title: String,
    author: String,
    created: { type: Date, default: Date.now },
    posts: [{
        text: String,
        author: String,
        created: { type: Date, default: Date.now }
    }]
});

app.get( '/threads', function( request, response ) {
    Thread.find(function( error, threads ) {
        response.send( error || threads );
    });
});

app.post( '/threads', function( request, response ) {
    Thread.create({
        title: request.body.title,
        author: request.body.author
    }, function( error, thread ) {
        response.send( error || thread );
    });
});

app.get( '/threads/:id', function( request, response ) {
    Thread.findById( request.params.id, function( error, thread ) {
        response.send( error || thread );
    });
});

app.listen( app.get( 'port' ), function() {
    console.log( 'Forum server listening on port ' + app.get( 'port' ) );
});
