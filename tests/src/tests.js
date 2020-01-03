"use strict"

import {$,$$,$onready} from "Libs/dom_utils.js"
import {DatePicker} from "Libs/date_picker.js"
import {Dropdown} from "Libs/dropdown.js"

$onready(function() {
	const datepicker = DatePicker($(".date-picker"))
	const dropdownTag = Dropdown($(".dropdown")).$("span")
	dropdownTag.innerText = datepicker.toString()
	datepicker.on("datechange", function() {
		dropdownTag.innerText = this.toString()
	})
})