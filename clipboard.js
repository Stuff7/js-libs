import {$,$$} from "./dom_utils.js"

const HTML = {}

export function ClipboardInput(elem) {
	if(!(this instanceof ClipboardInput)) return new ClipboardInput(elem)
	elem.innerHTML = HTML.base
	this.input = elem.$(".input")
	this.setValue(elem.dataset.value || "")
	this.dataset = elem.dataset
	elem.$(".button").on("click", ()=> {
		const range = document.createRange()
		range.selectNode(this.input)
		window.getSelection().removeAllRanges()
		window.getSelection().addRange(range)
		document.execCommand("copy")
		window.getSelection().removeAllRanges()
	})
}

ClipboardInput.prototype.setHTML = function(html) {
	this.html = this.input.innerHTML = html
}
ClipboardInput.prototype.setValue = function(value) {
	this.value = this.input.innerText = value
}

HTML.base =
`<div class="input"></div>`+
`<div class="button">`+
	`<svg viewBox="0 0 36 36">`+
		`<rect x="8" y="6" width="24" height="28" rx="2"/>`+
		`<path d="M24 2 H6 q-2 0 -2 2 V28"/>`+
	"</svg>"+
"</div>"