// A basic forum server.

'use strict';

var express  = require( 'express' );
var mongoose = require( 'mongoose' );

var app = express();

app.set( 'port', 3000 );
app.set( 'mongodb', 'mongodb://localhost/test' );

app.use( express.logger( 'dev' ) );
app.use( express.bodyParser() );
app.use( express.methodOverride() );

var Thread = mongoose.model( 'Thread', {
    title: String,
    author: String,
    created: { type: Date, default: Date.now }
});

var Post = mongoose.model( 'Post', {
    threadId: {
        type: mongoose.Schema.ObjectId,
        // There must be a thread with the given id.
        validate: function( value, respond ) {
            Thread.findById( value, function( error, thread ) {
                // Respond with false if a thread doesn't exist with that id.
                respond( error ? false : ( thread !== null ) );
            });
        }
    },
    text: String,
    author: String,
    created: { type: Date, default: Date.now }
});

// These route handlers don't account for HTTP response codes, security,
// authorization or performance. They're just demonstrative.

var sendErrorOrDocument = function( response ) {
    return function( error, document ) {
        response.send( error || document );
    };
};

app.get( '/threads', function( request, response ) {
    Thread.find( sendErrorOrDocument( response ) );
});

app.post( '/threads', function( request, response ) {
    Thread.create( request.body, sendErrorOrDocument( response ) );
});

app.get( '/threads/:id', function( request, response ) {
    Thread.findById( request.params.id, function( threadError, thread ) {
        if ( threadError ) {
            return response.send( threadError );
        }
        Post.find({ threadId: thread._id }, function( postError, posts ) {
            response.send( postError || { thread: thread, posts: posts } );
        });
    });
});

app.patch( '/threads/:id', function( request, response ) {
    Thread.findByIdAndUpdate(
        request.params.id,
        { $set: request.body },
        sendErrorOrDocument( response )
    );
});

app.post( '/posts', function( request, response ) {
    Post.create(
        request.body,
        sendErrorOrDocument( response )
    );
});

app.patch( '/posts/:id', function( request, response ) {
    Post.findByIdAndUpdate(
        request.params.id,
        { $set: request.body },
        sendErrorOrDocument( response )
    );
});

mongoose.connect( app.get( 'mongodb' ) );

app.listen( app.get( 'port' ), function() {
    console.log( 'Forum server listening on port ' + app.get( 'port' ) );
});
