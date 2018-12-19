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

    	/* Create JSON Object */
    	/* Required because postmessage does not allow us to differentiate between different message types */
    	/* Had to reference span# because the other was catching ALL of the selectbox content */
        var json = {
            form: {
                demarche:            $('#demarche-container').find('span#demarche').text(),
                type:                $('#typeVehicule-container').find('span#typeVehicule').text(),
                date:                $('#dateMiseEnCirculation-container').find('span#dateMiseEnCirculation').text(),
                cv:                  $('#puissanceAdministrative-container').find('span#puissanceAdministrative').text(),
                energy:              $('#energie-container').find('span#energie').text(),
                departmentment:      $('#departement-container').find('span#departement').text(),
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
            }
        };

    	/* Send the data back to the parent */
    	/* Allows us to populate JSON with form data */
    	/* To enable system to work properly, need to ensure we can validate against the type of data returned */
    	event.source.postMessage(json, event.origin);

	} /* endif */

},false);
