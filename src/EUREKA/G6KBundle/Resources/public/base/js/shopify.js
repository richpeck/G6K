// Shopify (RPECK 16/12/2018)
// Used to collect information from form submission and translate it into a JSON response
// Shopify store takes response and appends it to order

// Because the page does not know if it's loaded, we need to message it FROM the iframe
// This presents a problem - how do you bind to the click event of the button
// The answer is to periodically test - this script simply needs to respond
// https://davidwalsh.name/window-postmessage
window.addEventListener('message',function(event) {

    /* Only reply to the store */
    /* Security stuff */
	if(event.origin !== 'https://carte-grise-pref-fr') return;

	/* Parse data and determine if it's something the screen needs */
	/* This is to counteract the iFrameResizer we have on the parent page */
	if(event.data.form) {

    	/* JSON Object */
    	/* Required because postmessage does not allow us to differentiate between different message types */
    	/* Had to reference span# because the other was catching ALL of the selectbox content */
			var json = { form: { results: {} }};

			/* Top Level */
			/* Each $(#Résultat-panel-1-fieldset-1) find > div#id span */
			$('#Résultat-panel-1-fieldset-1').children('div').each(function () {
				var label  = $(this).find("span.label").text(); /* Allows us to use the actual label */
				var output = $(this).find("span.output").text(); /* Now to populate the json variable with the id of the last span (.output) and its text */
				json.form[label.replace(/:/g,'').trim()] = output; /* Pass the data to the json object */
			});

			/* Bottom Level */
			/* Each $(#Résultat-panel-1-fieldset-2) find > div#id span */
			$('#Résultat-panel-1-fieldset-2').children('div').each(function () {
				var label  = $(this).find("span.label").text(); /* Allows us to use the actual label */
				var output = $(this).find("span.output").text(); /* Now to populate the json variable with the id of the last span (.output) and its text */
				json.form.results[label.replace(/:/g,'').trim()] = output; /* Pass the data to the json object */
			});

    	/* Send the data back to the parent */
    	/* Allows us to populate JSON with form data */
    	/* To enable system to work properly, need to ensure we can validate against the type of data returned */
    	event.source.postMessage(json, event.origin);

	} /* endif */

},false);
