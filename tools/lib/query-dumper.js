'use strict';

// TODO use this to experiment with web workers

void async function doTheThing() {
	const parseParam = (k, v) => {
		let parsedValue = v;
		let parsedType = null;
		// special types
		// TODO note special types on page
		switch (k) {
			case 'json':
				parsedType = 'JSON';
				try {
					parsedValue = JSON.parse(v);
					// Now make it pretty
					parsedValue = JSON.stringify(parsedValue, null, '\t');
				} catch (e) {
					parsedValue = 'Invalid';
				}
				break;

			case 'number':
			case 'int':
				parsedType = 'Integer';
				parsedValue = parseInt(v);
				break;

			case 'float':
				parsedType = 'Float';
				parsedValue = parseFloat(v);
				break;

			case 'bool':
				parsedType = 'Boolean';
				parsedValue = !!v;
				break;
		}

		return {
			key: k,
			rawValue: v,
			value: parsedValue,
			type: parsedType,
		};
	};

	const formatParamInfo = (info) => {
		if (info.type) {
			return `Key:\t${info.key}
Type:\t${info.type}
Given:\t${info.rawValue}
Parsed:\t${info.value}`;
		} else {
			return `Key:\t${info.key}
Value:\t${info.value}`;
		}
	};

	const mount = document.querySelector('.display');
	const params = new URLSearchParams(window.location.search);

	params.forEach((v, k) => {
		const info = parseParam(k, v);
		const div = document.createElement('pre');
		div.className = 'param';
		div.innerHTML = formatParamInfo(info);
		mount.append(div);
	});
}();
