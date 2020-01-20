export function next(generator, n = 1) {
	for(let x = 0; ++x < n;)
		generator.next()
}
export function toImgEmote(str, separator = "    ") {
	let n = ["zero","one","two","three","four","five","six","seven","eight","nine"]
	let s = {"!": "exclamation", "?": "question"}
	return str.replace(/[a-z]|\d| |!|\?/gi,c=>{
		if(c==" ") return separator
		const src = isNaN(c)&&(s[c]||`regional_indicator_${c.toLowerCase()}`)||n[c]
		return `<img alt=":${src}:" src="/static/assets/${src}.svg"></img> `
	});
}
export function randomChar(str) {
	return str[~~(Math.random()*str.length)]
}
export function clamp(val, min, max) {
	return val > max ? max : val < min ? min : val;
}
export function inRange(v,min,max) {
	return v >= min && v <= max
}
export function lastElem(array) {
	return array[array.length - 1];
}
export function formatStr(str, kwargs) {
	if(!kwargs) return str
	return str.replace(/{(\w+)}/g, function(match, name) { 
		return typeof kwargs[name] != 'undefined'
			? kwargs[name]
			: match
	})
}