import isBase64 from 'validator/lib/isBase64'

const maxImageB = 1024 * 1024
const maxVideoB = 1024 * 10240

const reduceToMap = <K, V>(map: Map<K, V>, e: [K[], V]) =>
   (e[0].forEach(k => map.set(k, e[1])), map)

const imageExtensions = [
   'png', 'jpg', 'jpeg', 'ico', 'webp', 'gif', 'svg',
   'heic', 'heics', 'heif', 'heifs', 'avci', 'avcs', 'avif', 'avifs',
   'tif', 'tiff', 'bmp', 'eps', 'ai'
]

const knownFileThresholds = ([
   [imageExtensions, maxImageB]
] as [string[], number][])
   .reduce(reduceToMap, new Map<string, number>())

function getFileExtension(path: string) {
   return /(?:\.([^.]+))?$/.exec(path)[1]
}

export function getFileSizeLimit(name: string): number {
   if (isBase64(name)) {
      return maxImageB
   }
   else {
      const ext = getFileExtension(name)
      return knownFileThresholds.get(ext) ?? maxVideoB
   }
}

// https://stackoverflow.com/questions/32540364/javascript-check-if-valid-base64-image

// function isImage(data){
//    let knownTypes = {
//      '/': 'data:image/jpg;base64,',
//      'i': 'data:image/png;base64,',
//      /*ETC*/
//      }
//      
//      let image = new Image()
//      
//      if(!knownTypes[data[0]]){
//        console.log("encoded image didn't match known types");
//        return false;
//      }else{
//        image.src = knownTypes[0]+data
//        image.onload = function(){
//          //This should load the image so that you can actually check
//          //height and width.
//          if(image.height === 0 || image.width === 0){
//            console.log('encoded image missing width or height');
//            return false;
//          }
//      }
//      return true;
// }