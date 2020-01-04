"use strict"

import {$,$$,$onready} from "Libs/dom_utils.js"
import {ColorPicker} from "Libs/color_picker.js"
import {Dropdown} from "Libs/dropdown.js"

$onready(function() {
	const colorpicker = ColorPicker($(".color-picker"))
	const dropdownTag = Dropdown($(".dropdown")).$("span")
	dropdownTag.innerText = colorpicker.color.hex()
	colorpicker.on("colorchange", function(color) {
		dropdownTag.innerText = color.hex()
	})
	$(".dropdown").on("customFocus", ()=> colorpicker.updateUI())
})