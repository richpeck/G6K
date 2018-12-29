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
			var json = { form: {} };

			/* Top Level */
			/* Each $(#Résultat-panel-1-fieldset-1) find > div#id span */
			$('#Résultat-panel-1-fieldset-1').children('div').each(function () {
				var label  = $(this).find("span.label").text(); /* Allows us to use the actual label */
				var output = $(this).find("span.output").text(); /* Now to populate the json variable with the id of the last span (.output) and its text */
				json.form[label.replace(/:/g,'').trim()] = output; /* Pass the data to the json object */
			});

			/* Next Level */
			/* Adds results (manually coded) */
			$.extend(json.form, {
				results: {
					y1_taxe_regionale:                                  $('#taxeRegionaleY1-container').find('#taxeRegionaleY1').text(),
					y1a_taxe_additionnelle_voitures_de_forte_puissance: $('#taxeAdditionnelleFortePuissance-container').find('#taxeAdditionnelleFortePuissance').text(),
					y2_taxe_formation_professionnelle:                  $('#taxeFormationProfessionnelleY2-container').find('#taxeFormationProfessionnelleY2').text(),
					y3_taxe_additionnelle_voitures_de_tourisme:         $('#Y3_taxe-container').find('#Y3_taxe').text(),
					y3a_malus_CO2_voitures_de_tourisme:                 $('#Y3_Malus-container').find('#Y3_Malus').text(),
					y4_taxe_gestion:                                    $('#taxeGestionY4-container').find('#taxeGestionY4').text(),
					y5_redevance_acheminement:                          $('#redevanceAcheminementY5-container').find('#redevanceAcheminementY5').text(),
					y6_taxes_a_payer:                                   $('#taxesAPayerY6-container').find('#taxesAPayerY6').text()
				}
			});

    	/* Send the data back to the parent */
    	/* Allows us to populate JSON with form data */
    	/* To enable system to work properly, need to ensure we can validate against the type of data returned */
    	event.source.postMessage(json, event.origin);

	} /* endif */

},false);
