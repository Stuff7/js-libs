export function Color(color) {
	if(!(this instanceof Color)) return new Color(color)
	if(color) return this.copy(color)
	this.hue = this.saturation = this.value = this.r = this.g = this.b = 0
	this.a = 1; this.options = { min: 0, max: 255 }
}
Color.prototype.setOptions = function(options) {
	for(const k in options)
		this.options[k] = options[k]
	return this
}
Color.prototype.copy = function(color) {
	if(!(color instanceof Color)) throw Error("Parameter must be a Color")
	this.r = color.r; this.g = color.g; this.b = color.b; this.a = color.a
	this.hue = color.hue; this.saturation = color.saturation
	this.value = color.value; this.options = color.options
}
Color.prototype.toString = function() {
	return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
}
Color.prototype.toRGBString = function() {
	return `rgb(${this.r}, ${this.g}, ${this.b})`
}
Color.prototype.random = function(greyscaleChance) {
	if(greyscaleChance && Math.random()*100 < greyscaleChance)
		this.r = this.g = this.b = Math.max(~~(Math.random()*this.options.max), this.options.min)
	else
		([this.r, this.g, this.b] = Array.from({length: 3}, ()=> ~~(Math.random()*this.options.max)))
		.some(c=> c < this.options.min)&&(this["rgb"[~~(Math.random()*3)]]=this.options.min)
	return this
}
Color.prototype.hex = function() {
	const r = (~~this.r).toString(16).padStart(2,0),
				g = (~~this.g).toString(16).padStart(2,0),
				b = (~~this.b).toString(16).padStart(2,0),
				a = this.a != 1? (~~(this.a*255)).toString(16).padStart(2,0) : ""
	return `#${r}${g}${b}${a}`.padEnd(7,0)
}
Color.prototype.strength = function(strength=1) {
	const color = new Color(this)
	if(strength == 1) return color
	for(const k of "rgb")
		color[k] = Math.min(~~(color[k]*strength), 255)
	return color
}
Color.prototype.setRGBA = function(r,g,b,a) {
	this.r = r; this.g = g; this.b = b; this.a = a
}
Color.prototype.setRGB = function(r,g,b) {
	this.r = r; this.g = g; this.b = b
}
Color.prototype.setByName = function(name, value) {
	if(name=="r"||name=="g"||name=="b") {
		this[name] = value
		this.updateHSV()
	}
}
Color.prototype.setHSV = function(h,s,v) {
	this.hue = h; this.saturation = s; this.value = v
	this.HSVtoRGB()
}
Color.prototype.setHue = function(hue) {
	this.hue = hue
	this.HSVtoRGB()
}
Color.prototype.setSaturation = function(saturation) {
	this.saturation = saturation
	this.HSVtoRGB()
}
Color.prototype.setValue = function(value) {
	this.value = value
	this.HSVtoRGB()
}
Color.prototype.setHue = function(hue) {
	this.hue = hue
	this.HSVtoRGB()
}
Color.prototype.hexToRGB = function(hex) {
	if(!/^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/gi.test(hex)) return
	hex = hex.slice(1)
	if(hex.length == 3) {
		const fullHex = ""
		for(const x of hex)
			fullHex+=x+x
		hex = fullHex
	}
	if(hex.length >= 6) {
		let i = 0
		for(const k of "rgb")
			this[k] = parseInt(hex[i++]+hex[i++], 16)
		this.a = hex.length==8? (parseInt(hex.slice(-2), 16)/255).toFixed(2) : "1.0"
	}
	this.updateHSV()
}
Color.prototype.HSVtoRGB = function() {
	const sat = this.saturation / 100
	const value = this.value / 100
	let C = sat * value
	const H = this.hue / 60
	let X = C * (1 - Math.abs(H % 2 - 1))
	let m = value - C
	const precision = 255

	C = (C + m) * precision | 0
	X = (X + m) * precision | 0
	m = m * precision | 0

	if (H >= 0 && H < 1) {	this.setRGB(C, X, m);	return }
	if (H >= 1 && H < 2) {	this.setRGB(X, C, m);	return }
	if (H >= 2 && H < 3) {	this.setRGB(m, C, X);	return }
	if (H >= 3 && H < 4) {	this.setRGB(m, X, C);	return }
	if (H >= 4 && H < 5) {	this.setRGB(X, m, C);	return }
	if (H >= 5 && H < 6) {	this.setRGB(C, m, X);	return }
}
Color.prototype.updateHSV = function() {
	const red		= this.r / 255
	const green	= this.g / 255
	const blue	= this.b / 255

	const cmax = Math.max(red, green, blue)
	const cmin = Math.min(red, green, blue)
	const delta = cmax - cmin
	let hue = 0
	let saturation = 0

	if (delta) {
		if (cmax === red ) { hue = ((green - blue) / delta) }
		if (cmax === green ) { hue = 2 + (blue - red) / delta }
		if (cmax === blue ) { hue = 4 + (red - green) / delta }
		if (cmax) saturation = delta / cmax
	}

	this.hue = 60 * hue | 0
	if (this.hue < 0) this.hue += 360
	this.saturation = (saturation * 100) | 0
	this.value = (cmax * 100) | 0
}
Color.random = function(options) {
	const color = new Color().setOptions(options).random()
	color.updateHSV()
	return color
}
Color.RGB = Color.RGBA = function(r=0,g=0,b=0,a=1) {
	const color = new Color()
	color.setRGBA(r,g,b,a)
	color.updateHSV()
	return color
}
Color.HSV = function(h=0,s=0,v=0) {
	const color = new Color()
	color.setHSV(h,s,v)
	return color
}

export function Palette(color) {
	if(!(this instanceof Palette)) return new Palette(color)
	this.baseColor = color
	this.shades = {}
	this.update()
}
Palette.prototype.update = function() {
	this.shades.darker = this.baseColor.strength(.08).toString(),
	this.shades.dark = this.baseColor.strength(.15).toString(),
	this.shades.dim = this.baseColor.strength(.4).toString(),
	this.shades.normal = this.baseColor.strength(.7).toString(),
	this.shades.light = this.baseColor.toString()
	return this
}
Palette.prototype.random = function() {
	this.baseColor.random()
	return this.update()
}
Palette.prototype.updateHTML = function(suffix="c1") {
	for(const k in this.shades)
		document.documentElement.style.setProperty(`--${k}-${suffix}`, this.shades[k])
	return this
}
Palette.random = function(options) {
	return new Palette(Color.random(options))
}//