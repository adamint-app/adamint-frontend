export function replaceAll(str: string, replace: string, strwith: string, caseInsensitive = false) {
   if(!caseInsensitive){
      return str.split(replace).join(strwith)
   } else {
      const esc = replace.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      const reg = new RegExp(esc, 'ig')
      return str.replace(reg, strwith)
   }
}

export function functionString(str: () => string) {
   return typeof str === 'string' ? str : str()
}
export function mkFunctionString(str: () => string) {
   return typeof str === 'string'
      ? () => {
           return str
        }
      : str
}

// https://stackoverflow.com/questions/26156292/trim-specific-character-from-a-string

export function trim(str: string, ch: string) {
   let start = 0, 
       end = str.length

   while(start < end && str[start] === ch)
       ++start

   while(end > start && str[end - 1] === ch)
       --end

   return (start > 0 || end < str.length) ? str.substring(start, end) : str
}

export function trimStart(str: string, ch: string) {
   let start = 0 
   const end = str.length

   while(start < end && str[start] === ch)
       ++start

   return (start > 0 || end < str.length) ? str.substring(start, end) : str
}

export function trimEnd(str: string, ch: string) {
   const start = 0
   let end = str.length

   while(end > start && str[end - 1] === ch)
       --end

   return (start > 0 || end < str.length) ? str.substring(start, end) : str
}