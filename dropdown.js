import {$,$$,parents} from "./dom_utils.js"

const customBlur = new CustomEvent("customBlur"),
			customFocus = new CustomEvent("customFocus")

export function Dropdown(dropdownElem) {
	if(!document.body.contains(dropdownElem)) throw Error("Dropdown element must be part of DOM")
	createDropdown(dropdownElem)
	for(const innerDropdown of dropdownElem.$$(".inner-dropdown")) {
		createDropdown(innerDropdown)
		const parent = innerDropdown.parentNode.$("ul")
		innerDropdown.$("label").onclick = ()=> innerDropdown.replaceWith(parent)
		$(`#${innerDropdown.id.slice(0,-6)}`).onclick = ()=> {
			parent.replaceWith(innerDropdown)
			innerDropdown.dispatchEvent(customFocus)
		}
		innerDropdown.remove()
	}
	return dropdownElem
}

function createDropdown(dropdownElem) {
	let shouldCancel = false
	function blur() {
		dropdownElem.classList.remove("focused")
		dropdownElem.dispatchEvent(customBlur)
	}

	for(const parent of parents(dropdownElem))
		parent.on("mousedown", function(e) { !e.button&&blur() })

	dropdownElem.on("mousedown", function(e) {
		if(e.button) return
		e.stopPropagation()
		if(!this.classList.contains("focused")) {
			this.classList.add("focused")
			this.dispatchEvent(customFocus)
		}
		else if(shouldCancel) return (shouldCancel = false)
		else blur()
	})
	const ul = dropdownElem.$("ul")
	if(ul) {
		for(const child of ul.$$("*")) {
			child.on("mousedown", function(e) {
				if(!e.button) shouldCancel = true
			})
		}
	}
}