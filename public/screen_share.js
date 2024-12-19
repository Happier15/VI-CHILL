var myscreen ='';  // saving own screen
function start_screen_share(){
 try{
   navigator.mediaDevices.getDisplayMedia({
     video: {
       cursor: "always"
     },
     audio: {
       echoCancellation: true,
       noiseSuppression: true
     }
   }).then((stream)=> {
       let videoTrack = stream.getVideoTracks()[0];
       screen = stream;
       broadcastNewTracks( stream, 'video');
       myvid.srcObject = stream;  // Now my video will show this stream as video

       screen.getVideoTracks()[0].addEventListener( 'ended', () => {
            stopSharingScreen();
            myvid.srcObject = myvidstr;
        } );
   }).catch(err => {
     console.log(err); // for checking error in console
   })

 }catch(err){
    console.log(err); // for checking error in console
 }

};


function stopSharingScreen(){
  return new Promise( ( res, rej ) => {
          screen.getTracks().length ? screen.getTracks().forEach( track => track.stop() ) : '';
              res();
          } ).then( () => {
              broadcastNewTracks( myvidstr, 'video' );
          } ).catch( ( e ) => {
              console.error( e ); // for checking error in console
          } );
}

function broadcastNewTracks( stream, type) {
    let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
    for ( let p in peers ) {
        let pName = peers[p];
        if ( typeof pName == 'object' ) {
            replaceTrack( track, pName);
        }
    }
}
// function to replace video screen with desktop screen
function replaceTrack( stream, recipientPeer ) {
    let sender = recipientPeer.peerConnection.getSenders ? recipientPeer.peerConnection.getSenders().find( s => s.track && s.track.kind === stream.kind ) : false;
    sender ? sender.replaceTrack( stream ) : '';
}


