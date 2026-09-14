// Rând. 5100 col. 1 ≥ rând. 2000 col. 1 - rând. 2100 col. 1 (pe filiale)
function validate_CAP1_5100_vs_2000_F(values) {
    var col = "C1";

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CUATM = String(values.CAP_CUATM_FILIAL[j] || "");

        var r5100_F = values["CAP1_R5100_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R5100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col + "_FILIAL"][j]) : 0;

        var r2000_F = values["CAP1_R2000_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R2000_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R2000_" + col + "_FILIAL"][j]) : 0;

        var r2100_F = values["CAP1_R2100_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R2100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R2100_" + col + "_FILIAL"][j]) : 0;

        var required_F = r2000_F - r2100_F;

        if (r5100_F < required_F) {
            webform.errors.push({
                fieldName: 'CAP1_R5100_' + col + '_FILIAL',
                index: j,
                weight: 19,
                msg: Drupal.t(
                    'Raion: @CUATM - Cod eroare: 45-2000-F. ' +
                    'Rând.5100 col.1 trebuie să fie ≥ (Rând.2000 col.1 - Rând.2100 col.1). ' +
                    'Valoare 5100: @v5100, valoare 2000: @v2000, valoare 2100: @v2100, necesar: @req',
                    {
                        '@CUATM': CUATM,
                        '@v5100': r5100_F,
                        '@v2000': r2000_F,
                        '@v2100': r2100_F,
                        '@req': required_F
                    }
                )
            });
        }
    }
}

// Rând. 5100 col. 1 ≥ rând. 2000 col. 1 - rând. 2100 col. 1 (total)
function validate_CAP1_5100_vs_2000(values) {
    var col = "C1";

    var r5100 = !isNaN(Number(values["CAP1_R5100_" + col]))
        ? Number(values["CAP1_R5100_" + col]) : 0;

    var r2000 = !isNaN(Number(values["CAP1_R2000_" + col]))
        ? Number(values["CAP1_R2000_" + col]) : 0;

    var r2100 = !isNaN(Number(values["CAP1_R2100_" + col]))
        ? Number(values["CAP1_R2100_" + col]) : 0;

    var required = r2000 - r2100;

    if (r5100 < required) {
        webform.errors.push({
            fieldName: 'CAP1_R5100_' + col,
            weight: 19,
            msg: Drupal.t(
                'Cod eroare: 45-2000. Rând.5100 col.1 trebuie să fie ≥ (Rând.2000 col.1 - Rând.2100 col.1). ' +
                'Valoare 5100: @v5100, valoare 2000: @v2000, valoare 2100: @v2100, necesar: @req',
                {
                    '@v5100': r5100,
                    '@v2000': r2000,
                    '@v2100': r2100,
                    '@req': required
                }
            )
        });
    }
}
