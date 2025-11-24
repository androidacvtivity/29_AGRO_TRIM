// Analyze the project file - get to know the project.
// Modify the validation in the following logic.
//Rând. 5100 col. 1 ≥ rând. 2000 col. 1- rând. 2100 col. 1
function validate_CAP1_5100_vs_2000_F(values) {
    var col = "C1";

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CUATM = String(values.CAP_CUATM_FILIAL[j] || "");
        var r5100_F = values["CAP1_R5100_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R5100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col + "_FILIAL"][j]) : 0;
        var r2000_F = values["CAP1_R2000_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R2000_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R2000_" + col + "_FILIAL"][j]) : 0;

        if (r5100_F < r2000_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R5100_' + col + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t('Raion: @CUATM - Cod eroare: 45-2000-F. Rând.5100 col.1 trebuie să fie ≥ Rând.2000 col.1. Valoare 5100: ' + r5100_F + ', valoare 2000: ' + r2000_F, {
                    '@CUATM': CUATM
                })
            });
        }
    }
}


function validate_CAP1_5100_vs_2000(values) {
    var col = "C1";
    var r5100 = !isNaN(Number(values["CAP1_R5100_" + col])) ? Number(values["CAP1_R5100_" + col]) : 0;
    var r2000 = !isNaN(Number(values["CAP1_R2000_" + col])) ? Number(values["CAP1_R2000_" + col]) : 0;

    if (r5100 < r2000) {
        webform.errors.push({
            'fieldName': 'CAP1_R5100_' + col,
            'weight': 19,
            'msg': Drupal.t('Cod eroare: 45-2000. Rând.5100 col.1 trebuie să fie ≥ Rând.2000 col.1. Valoare 5100: ' + r5100 + ', valoare 2000: ' + r2000)
        });
    }
}

