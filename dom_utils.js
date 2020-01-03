import "./pollyfills.js"

Element.prototype.$ = Element.prototype.querySelector
Element.prototype.$$ = Element.prototype.querySelectorAll
Node.prototype.on = Node.prototype.addEventListener

export const $ = document.querySelector.bind(document)
export const $$ = document.querySelectorAll.bind(document)

export function $onready(fn) {
	document.on("DOMContentLoaded", fn)
}

export function parents(elem) {
	const nodes = []
	while(elem.parentNode != document) {
		nodes.unshift(elem.parentNode)
		elem = elem.parentNode
	}
	return nodes
}
export function setMouseTracking(elem, callback) {
	elem.on("mousedown", function(e) {
		callback(e)
		document.on("mousemove", callback)
	})
	document.on("mouseup", function(e) {
		document.removeEventListener("mousemove", callback)
	})
}
export function getCookie(name) {
	const value = "; " + document.cookie;
	const parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}
export function createElement(name, options, ns) {
	const element = ns?document.createElementNS(ns, name):document.createElement(name)
	if(options) {
		const actions = {
			attrs() {
				for(const attr in options.attrs)
					element.setAttributeNS(null, attr, options.attrs[attr])
			},
			children() {element.append(...options.children)},
			classes() {element.classList.add(...options.classes)}
		}
		for(const key in options)
			actions[key]?actions[key]():(element[key] = options[key])
	}
	return element
}
export function clearNode(node) {
	while(node.firstChild) node.firstChild.remove()
	return node
}
export function createLogger() {
	const main = $("main")
	const xmlns = "http://www.w3.org/2000/svg"
	const msg = createElement("div", {innerText: "Copied!"})
	const logger = createElement("span", {id: "log", children: [
		createElement("svg", {attrs:{viewBox: "0 0 36 36"}, children: [
			createElement("path", {attrs:{d: "m34 6 l-24 24 l-6 -6"}}, xmlns)
		]}, xmlns),
		msg
	]})

	let removeTimeoutID
	logger.show = function() {
		clearTimeout(removeTimeoutID)
		main.append(this)
		setTimeout(()=>this.style.transform = "translate(-50%, -120px)", 10)
		removeTimeoutID = setTimeout(()=> {
			this.style.transform = "translateX(-50%)"
			setTimeout(()=>this.remove(), 300)
		}, 2e3)
	}
	logger.msg = function(text = msg.innerText) {
		return msg.innerText = text
	}

	return logger
}