import {Color} from "./color.js"
import {$, $$, setMouseTracking} from "./dom_utils.js"
import {clamp,lastElem} from "./utils.js"
import {CustomEventHandler} from "./event_handler.js"

const HTML = {}

export function ColorPicker(elem, color) {
	if(!(this instanceof ColorPicker)) return new ColorPicker(elem, color)
	this.setupHTML(elem)
	this.hueArea = elem.$(".hue")
	this.hsvArea = elem.$(".hsv-area")
	this.hsvPicker = this.hsvArea.$(".picker")
	this.alphaArea = elem.$(".alpha")
	this.alpha = this.alphaArea.$(".alpha > div:first-child")
	this.color = color || parseColorString(elem.dataset.color)
	this.inputs = {
		hue: elem.$("[data-name=hue]"),
		saturation: elem.$("[data-name=saturation]"),
		value: elem.$("[data-name=value]"),
		r: elem.$("[data-name=r]"),
		g: elem.$("[data-name=g]"),
		b: elem.$("[data-name=b]"),
		a: elem.$("[data-name=a]"),
		hex: elem.$("[data-name=hex]")
	}

	this.setupInputs()
	this.setupHSVArea()
	this.setupVerticalSliders()
	this.updateUI()
}
ColorPicker.prototype = new CustomEventHandler("colorchange", "colorinput")
ColorPicker.prototype.constructor = ColorPicker

ColorPicker.prototype.getColorString = function() {
	return this.color.r+":"+this.color.g+":"+this.color.b+":"+this.color.a
}
ColorPicker.prototype.verticalSliders = function*() {
	yield this.hueArea; yield this.alphaArea
}
ColorPicker.prototype.offsetPicker = function(w, h) {
	return [w - (this.hsvPicker.clientWidth >> 1), h - (this.hsvPicker.clientHeight >> 1)]
}
ColorPicker.prototype.updateInputs = function() {
	for(const property in this.inputs)
		this.inputs[property].value = property=="hex"? this.color[property]() : this.color[property]
	this.dispatchEvent("colorinput", this.color)
}
ColorPicker.prototype.updateUI = function() {
	this.updateInputs()
	let rect = this.hsvArea.getBoundingClientRect()
	const [offsetW, offsetH] = this.offsetPicker(
		~~(this.inputs.saturation.value*rect.width/100), rect.height-~~(this.inputs.value.value*rect.height/100))
	this.hsvPicker.style.left = `${offsetW}px`
	this.hsvPicker.style.top = `${offsetH}px`

	for(const slider of this.verticalSliders())
		slider.updateFromInputs()

	const rgb = `rgb(${maxHSV(this.color.hue)})`
	this.hsvArea.style.backgroundColor = rgb
	this.alpha.style.background = `linear-gradient(${rgb}, transparent)`
}
ColorPicker.prototype.dispatchColorChange = function() {
	const mouseup = ()=> {
		this.dispatchEvent("colorchange")
		document.removeEventListener("mouseup", mouseup)
	}
	document.on("mouseup", mouseup)
}

ColorPicker.prototype.setupHTML = function(elem) {
	const trans = { random: elem.$("trans[random]"), alwaysRandom: elem.$("trans[always-random]")}
	
	elem.innerHTML = HTML.colorPicker
	const randomButton = elem.$(".random-color div")
	const randomToggle = elem.$(".random-color label input")
	randomButton.on("mousedown", ()=> {
		this.color.random().updateHSV()
		this.updateUI()
		this.dispatchEvent("colorchange")
	})
	randomToggle.on("change", ()=>this.dispatchEvent("colorchange"))
	randomToggle.checked = elem.dataset.color == "random"

	const randomButtons = { random: randomButton, alwaysRandom: elem.$(".random-color label div") }
	for(const name in randomButtons)
		trans[name]&&(randomButtons[name].innerText = trans[name].innerText)

	delete ColorPicker.prototype.setupRandomButtons
}
ColorPicker.prototype.setupInputs = function() {
	for(let input in this.inputs) {
		input = this.inputs[input]
		const name = input.dataset.name
		let handler = fn=> {
			return ()=> {
				if(input.checkValidity())
					fn(input.value)
				else
					input.value = this.color[name]
				this.updateUI()
				this.dispatchEvent("colorchange")
			}
		}
		const fnName = name=="hex"? "hexToRGB" : "set"+name.capitalize()
		input.on("change", handler(name=="a"? v=>this.color.a=v
			: name.length>1? v=>this.color[fnName](v) : v=>this.color.setByName(name,v)))
	}
	delete ColorPicker.prototype.setupInputs
}
ColorPicker.prototype.setupHSVArea = function() {
	this.hsvArea.on("mousedown", ()=> this.dispatchColorChange())
	setMouseTracking(this.hsvArea, e=> {
		const rect = this.hsvArea.getBoundingClientRect()
		const width = clamp(e.clientX - rect.left, 0, rect.width)
		const height = clamp(e.clientY - rect.top, 0, rect.height)
		const [offsetW, offsetH] = this.offsetPicker(width, height)

		this.hsvPicker.style.left = `${offsetW}px`
		this.color.setSaturation(~~(width*100/rect.width))
		this.hsvPicker.style.top = `${offsetH}px`
		this.color.setValue(~~((rect.height-height)*100/rect.height))

		this.updateInputs()
	})
	delete ColorPicker.prototype.setupHSVArea
}
ColorPicker.prototype.setupVerticalSliders = function() {
	for(const sliderArea of this.verticalSliders()) {
		const isHue = sliderArea.classList.contains("hue")
		const slider = sliderArea.$(".slider-picker")
		const updateHsvArea = isHue?
		(h, rectH)=> {
			this.color.setHue(~~((rectH-h)*359/rectH))
			const rgb = `rgb(${maxHSV(this.color.hue)})`
			this.hsvArea.style.backgroundColor = rgb
			this.alpha.style.background = `linear-gradient(${rgb}, transparent)`
		} :
		(h, rectH)=> {
			this.inputs.a.value = this.color.a = ((rectH-h)/rectH).toFixed(2)
		}
		function updateFromInputs(value) {
			const rect = sliderArea.getBoundingClientRect()
			const height = clamp(rect.height-~~(value*rect.height), 0, rect.height)
			slider.style.top = `${height}px`
		}
		sliderArea.updateFromInputs = isHue?
		()=> {
			updateFromInputs(this.inputs.hue.value/359)
		} :
		()=> {
			updateFromInputs(this.inputs.a.value)
		}
		sliderArea.on("mousedown", ()=> this.dispatchColorChange())
		setMouseTracking(sliderArea, e=> {
			const rect = sliderArea.getBoundingClientRect()
			const height = clamp(e.clientY - rect.top, 0, rect.height)

			slider.style.top = `${height}px`
			updateHsvArea(height, rect.height)
			this.updateInputs()
		})
	}
	delete ColorPicker.prototype.setupVerticalSliders
}
function maxHSV(h) {
	const H = h / 60

	const C = 255
	const X = (1 - Math.abs(H % 2 - 1)) * C | 0
	const m = 0

	if (H >= 0 && H < 1) return [C, X, m]
	if (H >= 1 && H < 2) return [X, C, m]
	if (H >= 2 && H < 3) return [m, C, X]
	if (H >= 3 && H < 4) return [m, X, C]
	if (H >= 4 && H < 5) return [X, m, C]
	if (H >= 5 && H < 6) return [C, m, X]
}
function parseColorString(data) {
	if(typeof data == "string") {
		if(data.toLowerCase() == "random") return Color.random({min:255,max:500})
		const color = data.split(":")
		let format = lastElem(color).toUpperCase()
		if(isNaN(parseFloat(format))) color.pop()
		for(const c in color)
			if(isNaN((color[c] = parseFloat(color[c]))))
				throw Error(`Could not parse color ${c} in ColorPicker creation`)
		if(!(format == "HSV" || format == "RGB" || format == "RGBA"))
			format = "RGB" 
		return Color[format](...color)
	}
	return Color.HSV(0, 100, 100)
}

HTML.colorPicker = 
	`<div class="picker-wrapper">`+
		`<div class="hue"><div class="slider-picker"></div></div>`+
		`<div class="hsv-wrapper"><div class="hsv-area"><div><div class="picker"></div></div></div></div>`+
		`<div class="alpha"><div><div class="slider-picker"></div></div></div>`+
	"</div>"+
	`<div class="inputs">`+["H:hue","S:saturation","V:value","R:r","G:g","B:b"].reduce((html,arr)=>{
			const [name,data] = arr.split(":")
			return html+=`<label><span><span>${name}</span></span><input type="number" data-name="${data}"></label>`
		}, "")+
		`<label><span><span>Alpha</span></span><input type="number" step=".01" data-name="a"></label>`+
		`<label><span><span>#</span></span><input data-name="hex"></label>`+
	"</div>"+
	`<div class="random-color">`+
		"<div>RANDOM</div>"+
		"<label>"+
			`<input type="checkbox">`+
			"<div>ALWAYS RANDOM</div>"+
		"</label>"+
	"</div>"