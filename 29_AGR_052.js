(function ($) {
    Drupal.behaviors.agr29 = {
        attach: function (context, settings) {
            jQuery('input.numeric').on('keypress', function (event) {
                if (isNumberPressed(this, event) === false) {
                    event.preventDefault();
                }
            });
            jQuery('input.float').on('keypress', function (event) {
                if (isNumberPressed(this, event) === false) {
                    event.preventDefault();
                }
            });

            var values = Drupal.settings.mywebform.values;

            watchLiveValidation_A09();
            toggle_A09(values);

            // 29-AGR: CAP_CUATM_FILIAL este preluat complet din JS.
            // Eliminam controlul vechi dynamic-cuatm si preluam selectul noi insine.
            agr29StartCuatmJs(context);

        }



    }
})(jQuery)



// ============================================================================
// 29-AGR - CAP_CUATM_FILIAL DIN JS (v052)
//
// In configuratia formularului CAP_CUATM_FILIAL are:
//   type   = text
//   widget = select2
//   class  = dynamic-cuatm
//
// Mecanismul generic dynamic-cuatm continua sa goleasca selectul atunci cand
// clasificatorul SQL nu intoarce date. De aceea nu este suficient sa adaugam
// option-uri: preluam controlul complet, eliminam vechile event handlers prin
// inlocuirea selectului cu o clona curata si initializam Select2 din lista JS.
// ============================================================================

var AGR29_CUATM_OPTIONS = [
    { value: '0100000', text: '0100000 - MUN.CHISINAU' },
    { value: '0300000', text: '0300000 - MUN.BALTI' },
    { value: '1000000', text: '1000000 - R-UL ANENII NOI' },
    { value: '1200000', text: '1200000 - R-UL BASARABEASCA' },
    { value: '1400000', text: '1400000 - R-UL BRICENI' },
    { value: '1700000', text: '1700000 - R-UL CAHUL' },
    { value: '2100000', text: '2100000 - R-UL CANTEMIR' },
    { value: '2500000', text: '2500000 - R-UL CALARASI' },
    { value: '2700000', text: '2700000 - R-UL CAUSENI' },
    { value: '2900000', text: '2900000 - R-UL CIMISLIA' },
    { value: '3100000', text: '3100000 - R-UL CRIULENI' },
    { value: '3400000', text: '3400000 - R-UL DONDUSENI' },
    { value: '3600000', text: '3600000 - R-UL DROCHIA' },
    { value: '3800000', text: '3800000 - R-UL DUBASARI' },
    { value: '4100000', text: '4100000 - R-UL EDINET' },
    { value: '4300000', text: '4300000 - R-UL FALESTI' },
    { value: '4500000', text: '4500000 - R-UL FLORESTI' },
    { value: '4800000', text: '4800000 - R-UL GLODENI' },
    { value: '5300000', text: '5300000 - R-UL HINCESTI' },
    { value: '5500000', text: '5500000 - R-UL IALOVENI' },
    { value: '5700000', text: '5700000 - R-UL LEOVA' },
    { value: '6000000', text: '6000000 - R-UL NISPORENI' },
    { value: '6200000', text: '6200000 - R-UL OCNITA' },
    { value: '6400000', text: '6400000 - R-UL ORHEI' },
    { value: '6700000', text: '6700000 - R-UL REZINA' },
    { value: '7100000', text: '7100000 - R-UL RISCANI' },
    { value: '7400000', text: '7400000 - R-UL SINGEREI' },
    { value: '7800000', text: '7800000 - R-UL SOROCA' },
    { value: '8000000', text: '8000000 - R-UL STRASENI' },
    { value: '8300000', text: '8300000 - R-UL SOLDANESTI' },
    { value: '8500000', text: '8500000 - R-UL STEFAN VODA' },
    { value: '8700000', text: '8700000 - R-UL TARACLIA' },
    { value: '8900000', text: '8900000 - R-UL TELENESTI' },
    { value: '9200000', text: '9200000 - R-UL UNGHENI' },
    { value: '9600000', text: '9600000 - UTA GAGAUZIA' },
    { value: '9800000', text: '9800000 - UATdS NISTRULUI' }
];

function agr29CuatmArrayIndex($select) {
    var rowIndex = parseInt($select.attr('row-index'), 10);
    if (!isNaN(rowIndex) && rowIndex > 0) {
        return rowIndex - 1;
    }

    var name = String($select.attr('name') || '');
    var m = name.match(/^CAP_CUATM_FILIAL\[(\d+)\]$/);
    if (m) {
        var n = parseInt(m[1], 10);
        return n > 0 ? n - 1 : 0;
    }

    return 0;
}

function agr29GetCuatmSavedValue($select) {
    var value = String($select.val() || '').trim();
    if (value !== '') {
        return value;
    }

    try {
        var values = Drupal.settings.mywebform.values;
        var list = values.CAP_CUATM_FILIAL || [];
        var index = agr29CuatmArrayIndex($select);
        if (typeof list[index] !== 'undefined' && list[index] !== null) {
            return String(list[index] || '').trim();
        }
    } catch (e) {
    }

    return '';
}

function agr29SyncCuatmToValues($select) {
    try {
        var values = Drupal.settings.mywebform.values;
        var index = agr29CuatmArrayIndex($select);
        var value = String($select.val() || '').trim();

        if (!Array.isArray(values.CAP_CUATM_FILIAL)) {
            values.CAP_CUATM_FILIAL = [];
        }

        values.CAP_CUATM_FILIAL[index] = value;
    } catch (e) {
        console.warn('[29-AGR CUATM] Nu am putut sincroniza Drupal.settings:', e);
    }
}


// Citeste valoarea direct din selectul REAL al randului din CAP.
// Important: numele DOM este CAP_CUATM_FILIAL[1], [2], ...,
// iar array-ul folosit de validarile existente este 0-based: [0], [1], ...
function agr29GetCuatmDomValueByValidationIndex(index) {
    var rowNo = index + 1;
    var $select = jQuery('select[field="CAP_CUATM_FILIAL"][row-index="' + rowNo + '"]').first();

    if (!$select.length) {
        $select = jQuery('select[name="CAP_CUATM_FILIAL[' + rowNo + ']"]').first();
    }

    if (!$select.length) {
        var $real = jQuery('select[field="CAP_CUATM_FILIAL"]').filter(function () {
            var name = String(jQuery(this).attr('name') || '');
            return !/\[0\]$/.test(name);
        });
        $select = $real.eq(index);
    }

    return $select.length ? String($select.val() || '').trim() : '';
}

// Sincronizeaza TOATE selecturile reale cu Drupal.settings.mywebform.values
// inainte de validare si inainte de salvare.
function agr29SyncAllCuatmFromDom() {
    try {
        var values = Drupal.settings.mywebform.values;

        if (!Array.isArray(values.CAP_CUATM_FILIAL)) {
            values.CAP_CUATM_FILIAL = [];
        }

        jQuery('select[field="CAP_CUATM_FILIAL"]').each(function () {
            var $select = jQuery(this);
            var name = String($select.attr('name') || '');
            var rowIndex = parseInt($select.attr('row-index'), 10);
            var m = name.match(/^CAP_CUATM_FILIAL\[(\d+)\]$/);
            var rowNo = !isNaN(rowIndex) && rowIndex > 0
                ? rowIndex
                : (m ? parseInt(m[1], 10) : 0);

            // [0] este sablonul ascuns, nu este un raion real.
            if (!rowNo || rowNo <= 0) {
                return;
            }

            var validationIndex = rowNo - 1;
            values.CAP_CUATM_FILIAL[validationIndex] = String($select.val() || '').trim();
        });

        return values.CAP_CUATM_FILIAL;
    } catch (e) {
        console.warn('[29-AGR CUATM] Sync all failed:', e);
        return [];
    }
}

function agr29BindCuatmBeforeSave() {
    jQuery('#mywebform-edit-form')
        .off('submit.agr29Cuatm052')
        .on('submit.agr29Cuatm052', function () {
            agr29SyncAllCuatmFromDom();
        });

    // Unele butoane ale platformei pornesc validarea inainte de submit.
    jQuery(document)
        .off('mousedown.agr29Cuatm052 click.agr29Cuatm052', '#mywebform-edit-form input[type="submit"], #mywebform-edit-form button[type="submit"]')
        .on('mousedown.agr29Cuatm052 click.agr29Cuatm052', '#mywebform-edit-form input[type="submit"], #mywebform-edit-form button[type="submit"]', function () {
            agr29SyncAllCuatmFromDom();
        });
}

function agr29AddCuatmOptions($select, savedValue) {
    $select.empty();
    $select.append(jQuery('<option>', { value: '', text: '' }));

    for (var i = 0; i < AGR29_CUATM_OPTIONS.length; i++) {
        $select.append(jQuery('<option>', {
            value: AGR29_CUATM_OPTIONS[i].value,
            text: AGR29_CUATM_OPTIONS[i].text
        }));
    }

    if (savedValue) {
        var exists = false;
        $select.find('option').each(function () {
            if (String(jQuery(this).val()) === savedValue) {
                exists = true;
                return false;
            }
        });

        if (!exists) {
            $select.append(jQuery('<option>', {
                value: savedValue,
                text: savedValue
            }));
        }

        $select.val(savedValue);
    }
}

function agr29DestroyOldSelect2($select) {
    try {
        if (typeof $select.select2 === 'function' && $select.hasClass('select2-hidden-accessible')) {
            $select.select2('destroy');
        }
    } catch (e) {
    }

    // Fallback daca Select2-ul vechi nu s-a distrus complet.
    $select.siblings('.select2-container').remove();
}

function agr29TakeOverOneCuatmSelect(selectElement, force) {
    var $old = jQuery(selectElement);

    if (!$old.length || $old.attr('field') !== 'CAP_CUATM_FILIAL') {
        return null;
    }

    if (!force && $old.attr('data-agr29-cuatm-owner') === '052' && $old.find('option').length > 1) {
        return $old;
    }

    var savedValue = agr29GetCuatmSavedValue($old);

    // Scoatem Select2-ul generic si orice handler direct atasat de dynamic-cuatm.
    agr29DestroyOldSelect2($old);

    var $select = $old.clone(false, false);

    $select
        .removeClass('dynamic-cuatm select2-hidden-accessible')
        .removeAttr('tabindex')
        .removeAttr('aria-hidden')
        .removeAttr('data-agr29-cuatm-from-js')
        .removeAttr('data-agr29-cuatm-ready')
        .attr('data-agr29-cuatm-owner', '052');

    agr29AddCuatmOptions($select, savedValue);

    $old.replaceWith($select);

    // Select2 nou, construit exclusiv din option-urile JS.
    try {
        if (typeof $select.select2 === 'function') {
            $select.select2({
                width: '200px',
                placeholder: 'Selectați cod CUATM',
                allowClear: true
            });
        }
    } catch (e) {
        console.error('[29-AGR CUATM] Eroare la initializarea Select2:', e);
    }

    $select.off('.agr29Cuatm052').on('change.agr29Cuatm052', function () {
        var $current = jQuery(this);
        agr29SyncCuatmToValues($current);
        agr29SyncAllCuatmFromDom();

        if (String($current.val() || '').trim() !== '') {
            $current.removeClass('error');
            $current.next('.select2-container').find('.select2-selection').removeClass('error');
        }
    });

    agr29SyncCuatmToValues($select);
    agr29SyncAllCuatmFromDom();

    console.log('[29-AGR CUATM] v052 OK:', $select.attr('name'), 'options=', $select.find('option').length);

    return $select;
}

function agr29TakeOverAllCuatmSelects() {
    jQuery('select[field="CAP_CUATM_FILIAL"]').each(function () {
        agr29TakeOverOneCuatmSelect(this, false);
    });
}

function agr29InstallCuatmObserver() {
    var container = document.querySelector('#CAP');
    if (!container || !window.MutationObserver || container._agr29CuatmObserver052) {
        return;
    }

    var observer = new MutationObserver(function (mutations) {
        var needRepair = false;

        for (var i = 0; i < mutations.length; i++) {
            var target = mutations[i].target;

            // Cazul principal: mecanismul vechi a golit option-urile unui select existent.
            if (target && target.nodeType === 1 && target.matches && target.matches('select[field="CAP_CUATM_FILIAL"]')) {
                if (target.options && target.options.length <= 1) {
                    needRepair = true;
                    break;
                }
            }

            // Cazul 2: platforma a creat un rand nou CAP.
            var added = mutations[i].addedNodes || [];
            for (var j = 0; j < added.length; j++) {
                var node = added[j];
                if (!node || node.nodeType !== 1) {
                    continue;
                }

                if ((node.matches && node.matches('select[field="CAP_CUATM_FILIAL"]')) ||
                    (node.querySelector && node.querySelector('select[field="CAP_CUATM_FILIAL"]'))) {
                    needRepair = true;
                    break;
                }
            }

            if (needRepair) {
                break;
            }
        }

        if (needRepair) {
            setTimeout(function () {
                jQuery('select[field="CAP_CUATM_FILIAL"]').each(function () {
                    if (this.options.length <= 1 || jQuery(this).attr('data-agr29-cuatm-owner') !== '052') {
                        agr29TakeOverOneCuatmSelect(this, true);
                    }
                });
            }, 20);
        }
    });

    observer.observe(container, {
        childList: true,
        subtree: true
    });

    container._agr29CuatmObserver052 = observer;
}

function agr29BindCuatmAddRow() {
    jQuery(document)
        .off('click.agr29Cuatm052', '.CAP-grid-addrow')
        .on('click.agr29Cuatm052', '.CAP-grid-addrow', function () {
            [50, 150, 400, 800].forEach(function (delay) {
                setTimeout(agr29TakeOverAllCuatmSelects, delay);
            });
        });
}

function agr29StartCuatmJs(context) {
    agr29TakeOverAllCuatmSelects();
    agr29InstallCuatmObserver();
    agr29BindCuatmAddRow();
    agr29BindCuatmBeforeSave();
    agr29SyncAllCuatmFromDom();

    // Platforma initializeaza grila in mai multe etape. Aceste verificari sunt
    // intentionat scurte si se opresc automat.
    [100, 300, 700, 1200, 2000, 3500].forEach(function (delay) {
        setTimeout(agr29TakeOverAllCuatmSelects, delay);
    });
}

// Fallback independent de ordinea Drupal.behaviors.
jQuery(function () {
    setTimeout(function () {
        if (document.querySelector('select[field="CAP_CUATM_FILIAL"]')) {
            agr29StartCuatmJs(document);
        }
    }, 0);
});


function watchLiveValidation_A09() {
    const inputSelector = '#PHONE';
    const errorID = 'error-A09';

    function showError(msg) {
        jQuery(`#${errorID}`).remove();
        const error = `<div id="${errorID}" class="webform-inline-error" style="
            color: red;
            font-weight: bold;
            margin-top: 6px;
            padding: 6px 10px;
            background-color: #fce4e4;
            border: 1px solid #d32f2f;
            border-radius: 4px;
            display: inline-block;
        ">${msg}</div>`;
        jQuery(inputSelector).after(error);
    }

    function validatePhoneLive() {
        const phone = jQuery(inputSelector).val().trim();
        jQuery(`#${errorID}`).remove();

        if (!/^[0-9]{9}$/.test(phone)) {
            showError('A.09 – Introduceți doar un număr de telefon format din 9 cifre');
        } else if (phone[0] !== '0') {
            showError('A.09 – Prima cifră a numărului de telefon trebuie să fie 0');
        }
    }

    jQuery(inputSelector).on('input blur', validatePhoneLive);
}

function toggle_A09(values) {
    var values = Drupal.settings.mywebform.values;
    const phone = values.PHONE || '';
    const errorID = 'error-A09';

    jQuery(`#${errorID}`).remove();

    if (!/^[0-9]{9}$/.test(phone)) {
        const errorMsg = 'A.09 – Introduceți doar un număr de telefon format din 9 cifre';
        jQuery('#PHONE').after(`<div id="${errorID}" class="webform-inline-error" style="
            color: red;
            font-weight: bold;
            margin-top: 6px;
            padding: 6px 10px;
            background-color: #fce4e4;
            border: 1px solid #d32f2f;
            border-radius: 4px;
            display: inline-block;
        ">${errorMsg}</div>`);
    } else if (phone[0] !== '0') {
        const errorMsg = 'A.09 – Prima cifră a numărului de telefon trebuie să fie 0';
        jQuery('#PHONE').after(`<div id="${errorID}" class="webform-inline-error" style="
            color: red;
            font-weight: bold;
            margin-top: 6px;
            padding: 6px 10px;
            background-color: #fce4e4;
            border: 1px solid #d32f2f;
            border-radius: 4px;
            display: inline-block;
        ">${errorMsg}</div>`);
    }
}

webform.validators.agr29 = function (v, allowOverpass) {
    // CAP_CUATM_FILIAL este alimentat din JS; sincronizam DOM -> values
    // chiar inainte de validarile raportului.
    agr29SyncAllCuatmFromDom();
    var values = Drupal.settings.mywebform.values;


    // 29_AGR_040
    //-----------------------------------------------------

    validatePhoneNumber(values.PHONE);

    validate45_001(values);
    validate45_002(values);
    validate45_003(values);
    validate45_004(values);
    validate45_005(values);
    validate45_006(values);
    validate45_007(values);
    validate45_008(values);
    validate45_009(values);
    validate45_010(values);
    validate45_011(values);
    validate45_012(values);
    validate45_013(values);
    validate_1800_C3(values);


    validate_1800_C3_F(values)
    validate45_001_F(values);
    validate45_002_F(values);
    validate45_003_F(values);
    validate45_004_F(values);
    validate45_005_F(values);
    validate45_006_F(values);
    validate45_007_F(values);
    validate45_008_F(values);
    validate45_009_F(values);
    validate45_010_F(values);
    validate45_011_F(values);
    validate45_012_F(values);
    validate45_013_F(values);

    validate_CUATM_FILIAL(values);

    validate_CAP1_R5000_C1(values);
    validate_CAP1_R5000_C1_F(values);

    validate_CAP1_R5100_C1(values);
    validate_CAP1_R5100_C1_F(values);

    validate45_2002(values);
    validate45_2002_F(values);

    validate45_2003(values);
    validate45_2003_F(values);
    //-----------------------------------------------------

    validate45_1800(values);
    validate45_1800_F(values);

    validate_CAP1_5100_vs_2000(values);
    validate_CAP1_5100_vs_2000_F(values);

    validate45_2001(values);
    validate45_2001_F(values);

    webform.warnings.sort(function (a, b) {
        return sort_errors_warinings(a, b);
    });
    webform.errors.sort(function (a, b) {
        return sort_errors_warinings(a, b);
    });
    webform.validatorsStatus['agr29'] = 1;
    validateWebform();
}

//------------------------------------------------------

//-------------------------------------------------------------------------------------
// Cod eroare: 45-2003
// Dacă sunt date în CAP.I rând.5000 col.1 și nu sunt date în rând.5100 col.1,
// atunci trebuie să fie date în CAP.II col.1 în unul din rândurile:
// 7100 sau 7200 sau 7300 sau 7400 sau 7500

function validate45_2003(values) {
    var col = "C1";
    var rowsCAP2 = [7100, 7200, 7300, 7400, 7500];

    var r5000 = !isNaN(Number(values["CAP1_R5000_" + col]))
        ? Number(values["CAP1_R5000_" + col])
        : 0;

    var r5100 = !isNaN(Number(values["CAP1_R5100_" + col]))
        ? Number(values["CAP1_R5100_" + col])
        : 0;

    var hasCap2Data = false;
    var details = [];

    for (var i = 0; i < rowsCAP2.length; i++) {
        var row = rowsCAP2[i];

        var val = !isNaN(Number(values["CAP2_R" + row + "_" + col]))
            ? Number(values["CAP2_R" + row + "_" + col])
            : 0;

        details.push("Rând." + row + " col.1: " + val);

        if (val > 0) {
            hasCap2Data = true;
        }
    }

    if (r5000 > 0 && r5100 <= 0 && !hasCap2Data) {
        webform.errors.push({
            'fieldName': 'CAP2_R7100_' + col,
            'weight': 19,
            'msg': Drupal.t(
                'Cod eroare: 45-2003. Dacă în CAP.I Rând.5000 col.1 sunt date și în Rând.5100 col.1 nu sunt date, atunci trebuie să fie date în CAP.II col.1 în unul din rândurile 7100, 7200, 7300, 7400 sau 7500. ' +
                'Valoare CAP.I Rând.5000 col.1: ' + r5000 +
                ', valoare CAP.I Rând.5100 col.1: ' + r5100 +
                '. CAP.II: ' + details.join(', ')
            )
        });
    }
}


//-------------------------------------------------------------------------------------
// Cod eroare: 45-2003-F
// Aceeași validare pentru filiale / raioane

function validate45_2003_F(values) {
    var col = "C1";
    var rowsCAP2 = [7100, 7200, 7300, 7400, 7500];

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CUATM = String(values.CAP_CUATM_FILIAL[j] || "");

        var r5000_F = values["CAP1_R5000_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R5000_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5000_" + col + "_FILIAL"][j])
            : 0;

        var r5100_F = values["CAP1_R5100_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R5100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col + "_FILIAL"][j])
            : 0;

        var hasCap2Data_F = false;
        var details_F = [];

        for (var i = 0; i < rowsCAP2.length; i++) {
            var row = rowsCAP2[i];

            var val_F = values["CAP2_R" + row + "_" + col + "_FILIAL"] &&
                !isNaN(Number(values["CAP2_R" + row + "_" + col + "_FILIAL"][j]))
                ? Number(values["CAP2_R" + row + "_" + col + "_FILIAL"][j])
                : 0;

            details_F.push("Rând." + row + " col.1: " + val_F);

            if (val_F > 0) {
                hasCap2Data_F = true;
            }
        }

        if (r5000_F > 0 && r5100_F <= 0 && !hasCap2Data_F) {
            webform.errors.push({
                'fieldName': 'CAP2_R7100_' + col + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t(
                    'Raion: @CUATM - Cod eroare: 45-2003-F. Dacă în CAP.I Rând.5000 col.1 sunt date și în Rând.5100 col.1 nu sunt date, atunci trebuie să fie date în CAP.II col.1 în unul din rândurile 7100, 7200, 7300, 7400 sau 7500. ' +
                    'Valoare CAP.I Rând.5000 col.1: ' + r5000_F +
                    ', valoare CAP.I Rând.5100 col.1: ' + r5100_F +
                    '. CAP.II: ' + details_F.join(', '),
                    {
                        '@CUATM': CUATM
                    }
                )
            });
        }
    }
}

//--------------------------------------------------------------
//-------------------------------------------------------------------------------------
// Cod eroare: 45-2002
// Dacă în CAP.II rând.7100 și/sau 7200 și/sau 7300 și/sau 7400 și/sau 7500 col.1 sunt date,
// atunci trebuie să fie date în CAP.I rând.5000 col.1

function validate45_2002(values) {
    var col = "C1";
    var rowsCAP2 = [7100, 7200, 7300, 7400, 7500];

    var r5000 = !isNaN(Number(values["CAP1_R5000_" + col]))
        ? Number(values["CAP1_R5000_" + col])
        : 0;

    var hasCap2Data = false;
    var details = [];

    for (var i = 0; i < rowsCAP2.length; i++) {
        var row = rowsCAP2[i];

        var val = !isNaN(Number(values["CAP2_R" + row + "_" + col]))
            ? Number(values["CAP2_R" + row + "_" + col])
            : 0;

        details.push("Rând." + row + " col.1: " + val);

        if (val > 0) {
            hasCap2Data = true;
        }
    }

    if (hasCap2Data && r5000 <= 0) {
        webform.errors.push({
            'fieldName': 'CAP1_R5000_' + col,
            'weight': 19,
            'msg': Drupal.t(
                'Cod eroare: 45-2002. Dacă în CAP.II Rând.7100 și/sau Rând.7200 și/sau Rând.7300 și/sau Rând.7400 și/sau Rând.7500 col.1 sunt date, atunci trebuie să fie date în CAP.I Rând.5000 col.1. ' +
                'Valoare CAP.I Rând.5000 col.1: ' + r5000 +
                '. CAP.II: ' + details.join(', ')
            )
        });
    }
}


//-------------------------------------------------------------------------------------
// Cod eroare: 45-2002-F
// Aceeași validare pentru filiale / raioane

function validate45_2002_F(values) {
    var col = "C1";
    var rowsCAP2 = [7100, 7200, 7300, 7400, 7500];

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CUATM = String(values.CAP_CUATM_FILIAL[j] || "");

        var r5000_F = values["CAP1_R5000_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R5000_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5000_" + col + "_FILIAL"][j])
            : 0;

        var hasCap2Data_F = false;
        var details_F = [];

        for (var i = 0; i < rowsCAP2.length; i++) {
            var row = rowsCAP2[i];

            var val_F = values["CAP2_R" + row + "_" + col + "_FILIAL"] &&
                !isNaN(Number(values["CAP2_R" + row + "_" + col + "_FILIAL"][j]))
                ? Number(values["CAP2_R" + row + "_" + col + "_FILIAL"][j])
                : 0;

            details_F.push("Rând." + row + " col.1: " + val_F);

            if (val_F > 0) {
                hasCap2Data_F = true;
            }
        }

        if (hasCap2Data_F && r5000_F <= 0) {
            webform.errors.push({
                'fieldName': 'CAP1_R5000_' + col + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t(
                    'Raion: @CUATM - Cod eroare: 45-2002-F. Dacă în CAP.II Rând.7100 și/sau Rând.7200 și/sau Rând.7300 și/sau Rând.7400 și/sau Rând.7500 col.1 sunt date, atunci trebuie să fie date în CAP.I Rând.5000 col.1. ' +
                    'Valoare CAP.I Rând.5000 col.1: ' + r5000_F +
                    '. CAP.II: ' + details_F.join(', '),
                    {
                        '@CUATM': CUATM
                    }
                )
            });
        }
    }
}

//--------------------------------------------------------------
//-------------------------------------------------------------------------------------
// Cod eroare: 45-2001
// Dacă CAP.I rând.5000 col.1 > rând.5100 col.1,
// trebuie să fie date în CAP.II col.1 în unul din rândurile:
// 7100 sau 7200 sau 7300 sau 7400 sau 7500

function validate45_2001(values) {
    var col = "C1";

    var r5000 = !isNaN(Number(values["CAP1_R5000_" + col]))
        ? Number(values["CAP1_R5000_" + col])
        : 0;

    var r5100 = !isNaN(Number(values["CAP1_R5100_" + col]))
        ? Number(values["CAP1_R5100_" + col])
        : 0;

    var rowsCAP2 = [7100, 7200, 7300, 7400, 7500];
    var hasCap2Data = false;
    var details = [];

    for (var i = 0; i < rowsCAP2.length; i++) {
        var row = rowsCAP2[i];

        var val = !isNaN(Number(values["CAP2_R" + row + "_" + col]))
            ? Number(values["CAP2_R" + row + "_" + col])
            : 0;

        details.push("Rând." + row + " col.1: " + val);

        if (val > 0) {
            hasCap2Data = true;
        }
    }

    if (r5000 > r5100 && !hasCap2Data) {
        webform.errors.push({
            'fieldName': 'CAP2_R7100_' + col,
            'weight': 19,
            'msg': Drupal.t(
                'Cod eroare: 45-2001. Dacă CAP.I Rând.5000 col.1 este mai mare decât Rând.5100 col.1, atunci trebuie să fie date în CAP.II col.1 în unul din rândurile 7100, 7200, 7300, 7400 sau 7500. ' +
                'Valoare Rând.5000 col.1: ' + r5000 +
                ', valoare Rând.5100 col.1: ' + r5100 +
                '. CAP.II: ' + details.join(', ')
            )
        });
    }
}


//-------------------------------------------------------------------------------------
// Cod eroare: 45-2001-F
// Aceeași validare pentru filiale / raioane

function validate45_2001_F(values) {
    var col = "C1";
    var rowsCAP2 = [7100, 7200, 7300, 7400, 7500];

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CUATM = String(values.CAP_CUATM_FILIAL[j] || "");

        var r5000_F = values["CAP1_R5000_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R5000_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5000_" + col + "_FILIAL"][j])
            : 0;

        var r5100_F = values["CAP1_R5100_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R5100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col + "_FILIAL"][j])
            : 0;

        var hasCap2Data_F = false;
        var details_F = [];

        for (var i = 0; i < rowsCAP2.length; i++) {
            var row = rowsCAP2[i];

            var val_F = values["CAP2_R" + row + "_" + col + "_FILIAL"] &&
                !isNaN(Number(values["CAP2_R" + row + "_" + col + "_FILIAL"][j]))
                ? Number(values["CAP2_R" + row + "_" + col + "_FILIAL"][j])
                : 0;

            details_F.push("Rând." + row + " col.1: " + val_F);

            if (val_F > 0) {
                hasCap2Data_F = true;
            }
        }

        if (r5000_F > r5100_F && !hasCap2Data_F) {
            webform.errors.push({
                'fieldName': 'CAP2_R7100_' + col + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t(
                    'Raion: @CUATM - Cod eroare: 45-2001-F. Dacă CAP.I Rând.5000 col.1 este mai mare decât Rând.5100 col.1, atunci trebuie să fie date în CAP.II col.1 în unul din rândurile 7100, 7200, 7300, 7400 sau 7500. ' +
                    'Valoare Rând.5000 col.1: ' + r5000_F +
                    ', valoare Rând.5100 col.1: ' + r5100_F +
                    '. CAP.II: ' + details_F.join(', '),
                    {
                        '@CUATM': CUATM
                    }
                )
            });
        }
    }
}

//-------------------------------------------------------------------------------------
// Rind. 5100 col.1
// Cod eroare: 45-2000
// Rând.5100 col.1 trebuie să fie ≥ Rând.2000 col.1 - Rând.2100 col.1

function validate_CAP1_5100_vs_2000_F(values) {
    var col = "C1";

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CUATM = String(values.CAP_CUATM_FILIAL[j] || "");

        var r5100_F = values["CAP1_R5100_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R5100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col + "_FILIAL"][j])
            : 0;

        var r2000_F = values["CAP1_R2000_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R2000_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R2000_" + col + "_FILIAL"][j])
            : 0;

        var r2100_F = values["CAP1_R2100_" + col + "_FILIAL"] &&
            !isNaN(Number(values["CAP1_R2100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R2100_" + col + "_FILIAL"][j])
            : 0;

        var control_F = r2000_F - r2100_F;

        if (r5100_F < control_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R5100_' + col + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t(
                    'Raion: @CUATM - Cod eroare: 45-2000-F. Rând.5100 col.1 trebuie să fie ≥ Rând.2000 col.1 - Rând.2100 col.1. Valoare 5100: ' +
                    r5100_F +
                    ', valoare 2000: ' +
                    r2000_F +
                    ', valoare 2100: ' +
                    r2100_F +
                    ', rezultat control: ' +
                    control_F,
                    {
                        '@CUATM': CUATM
                    }
                )
            });
        }
    }
}


function validate_CAP1_5100_vs_2000(values) {
    var col = "C1";

    var r5100 = !isNaN(Number(values["CAP1_R5100_" + col]))
        ? Number(values["CAP1_R5100_" + col])
        : 0;

    var r2000 = !isNaN(Number(values["CAP1_R2000_" + col]))
        ? Number(values["CAP1_R2000_" + col])
        : 0;

    var r2100 = !isNaN(Number(values["CAP1_R2100_" + col]))
        ? Number(values["CAP1_R2100_" + col])
        : 0;

    var control = r2000 - r2100;

    if (r5100 < control) {
        webform.errors.push({
            'fieldName': 'CAP1_R5100_' + col,
            'weight': 19,
            'msg': Drupal.t(
                'Cod eroare: 45-2000. Rând.5100 col.1 trebuie să fie ≥ Rând.2000 col.1 - Rând.2100 col.1. Valoare 5100: ' +
                r5100 +
                ', valoare 2000: ' +
                r2000 +
                ', valoare 2100: ' +
                r2100 +
                ', rezultat control: ' +
                control
            )
        });
    }
}


//------------------------------------------------------------------------------------

function validate45_1800(values) {
    var col3 = "C3";
    var col2 = "C2";

    var val_1800 = !isNaN(Number(values["CAP1_R1800_" + col3])) ? Number(values["CAP1_R1800_" + col3]) : 0;
    var val_1620 = !isNaN(Number(values["CAP1_R1620_" + col3])) ? Number(values["CAP1_R1620_" + col3]) : 0;
    var val_6100 = !isNaN(Number(values["CAP1_R6100_" + col2])) ? Number(values["CAP1_R6100_" + col2]) : 0;

    var sum = val_1620 + val_6100;

    if (val_1800 !== sum) {
        webform.errors.push({
            'fieldName': 'CAP1_R1800_' + col3,
            'weight': 19,
            'msg': Drupal.t('Cod eroare: 45-1800. Rând.1800 col.3 trebuie să fie egal cu Rând.1620 col.3 + Rând.6100 col.2. Valoare 1800: ' + val_1800 + ', suma calculată: ' + sum)
        });
    }
}
function validate45_1800_F(values) {
    var col3 = "C3";
    var col2 = "C2";

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CUATM = String(values.CAP_CUATM_FILIAL[j] || "");
        var val_1800_F = values["CAP1_R1800_" + col3 + "_FILIAL"] && !isNaN(Number(values["CAP1_R1800_" + col3 + "_FILIAL"][j]))
            ? Number(values["CAP1_R1800_" + col3 + "_FILIAL"][j]) : 0;
        var val_1620_F = values["CAP1_R1620_" + col3 + "_FILIAL"] && !isNaN(Number(values["CAP1_R1620_" + col3 + "_FILIAL"][j]))
            ? Number(values["CAP1_R1620_" + col3 + "_FILIAL"][j]) : 0;
        var val_6100_F = values["CAP1_R6100_" + col2 + "_FILIAL"] && !isNaN(Number(values["CAP1_R6100_" + col2 + "_FILIAL"][j]))
            ? Number(values["CAP1_R6100_" + col2 + "_FILIAL"][j]) : 0;

        var sum_F = val_1620_F + val_6100_F;

        if (val_1800_F !== sum_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R1800_' + col3 + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t('Raion: @CUATM - Cod eroare: 45-1800-F. Rând.1800 col.3 trebuie să fie egal cu Rând.1620 col.3 + Rând.6100 col.2. Valoare 1800: ' + val_1800_F + ', suma calculată: ' + sum_F, {
                    '@CUATM': CUATM
                })
            });
        }
    }
}





//-------------------------------------------------------------------------------

// Validation function for FILIAL: CAP1_R5100_C1 >= CAP1_R2000_C1 - CAP1_R2100_C1
function validate_CAP1_R5100_C1_F(values) {
    var col1 = "C1";

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        var CAP1_R5100_F = values["CAP1_R5100_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP1_R5100_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP1_R2000_F = values["CAP1_R2000_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP1_R2000_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP1_R2000_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP1_R2100_F = values["CAP1_R2100_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP1_R2100_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP1_R2100_" + col1 + "_FILIAL"][j])
            : 0;

        var calculatedDifference_F = CAP1_R2000_F - CAP1_R2100_F;

        if (CAP1_R5100_F < calculatedDifference_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R5100_' + col1 + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-015-F. Valoarea CAP1 Rând.5100 col.1 trebuie să fie ≥ CAP1 Rând.2000 col.1 - CAP1 Rând.2100 col.1. Valoarea găsită: ' + CAP1_R5100_F + ', valoarea minimă așteptată: ' + calculatedDifference_F, {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}


// Validation function: CAP1_R5100_C1 >= CAP1_R2000_C1 - CAP1_R2100_C1
function validate_CAP1_R5100_C1(values) {
    var col1 = "C1";

    var CAP1_R5100 = !isNaN(Number(values["CAP1_R5100_" + col1])) ? Number(values["CAP1_R5100_" + col1]) : 0;
    var CAP1_R2000 = !isNaN(Number(values["CAP1_R2000_" + col1])) ? Number(values["CAP1_R2000_" + col1]) : 0;
    var CAP1_R2100 = !isNaN(Number(values["CAP1_R2100_" + col1])) ? Number(values["CAP1_R2100_" + col1]) : 0;

    var calculatedDifference = CAP1_R2000 - CAP1_R2100;

    if (CAP1_R5100 < calculatedDifference) {
        webform.errors.push({
            'fieldName': 'CAP1_R5100_' + col1,
            'weight': 19,
            'msg': Drupal.t('Cod eroare: 45-015. Valoarea CAP1 Rând.5100 col.1 trebuie să fie ≥ CAP1 Rând.2000 col.1 - CAP1 Rând.2100 col.1. Valoarea găsită: ' + CAP1_R5100 + ', valoarea minimă așteptată: ' + calculatedDifference)
        });
    }
}



//--------------------------------------------------------------------------

// Validation function: CAP1_R5000_C1 = CAP1_R5100_C1 + CAP2_R7100_C1 + CAP2_R7200_C1 + CAP2_R7300_C1 + CAP2_R7400_C1 + CAP2_R7500_C1
function validate_CAP1_R5000_C1(values) {
    var col1 = "C1";

    var CAP1_R5000 = !isNaN(Number(values["CAP1_R5000_" + col1])) ? Number(values["CAP1_R5000_" + col1]) : 0;
    var CAP1_R5100 = !isNaN(Number(values["CAP1_R5100_" + col1])) ? Number(values["CAP1_R5100_" + col1]) : 0;
    var CAP2_R7100 = !isNaN(Number(values["CAP2_R7100_" + col1])) ? Number(values["CAP2_R7100_" + col1]) : 0;
    var CAP2_R7200 = !isNaN(Number(values["CAP2_R7200_" + col1])) ? Number(values["CAP2_R7200_" + col1]) : 0;
    var CAP2_R7300 = !isNaN(Number(values["CAP2_R7300_" + col1])) ? Number(values["CAP2_R7300_" + col1]) : 0;
    var CAP2_R7400 = !isNaN(Number(values["CAP2_R7400_" + col1])) ? Number(values["CAP2_R7400_" + col1]) : 0;
    var CAP2_R7500 = !isNaN(Number(values["CAP2_R7500_" + col1])) ? Number(values["CAP2_R7500_" + col1]) : 0;

    var calculatedSum = CAP1_R5100 + CAP2_R7100 + CAP2_R7200 + CAP2_R7300 + CAP2_R7400 + CAP2_R7500;

    if (CAP1_R5000 < calculatedSum) {
        webform.errors.push({
            'fieldName': 'CAP1_R5000_' + col1,
            'weight': 19,
            'msg': Drupal.t('Cod eroare: 45-014. Valoarea CAP.1 Rând.5000 col.1 trebuie să fie mai mare sau egala  cu suma valorilor: CAP1 Rând.5100 col.1, CAP2 Rând.7100 col.1, CAP2 Rând.7200 col.1, CAP2 Rând.7300 col.1, CAP2 Rând.7400 col.1 și CAP2 Rând.7500 col.1. Valoarea găsită: ' + CAP1_R5000 + ', suma calculată: ' + calculatedSum)
        });
    }
}


// Validation function for FILIAL: CAP1_R5000_C1 = CAP1_R5100_C1 + CAP2_R7100_C1 + CAP2_R7200_C1 + CAP2_R7300_C1 + CAP2_R7400_C1 + CAP2_R7500_C1
function validate_CAP1_R5000_C1_F(values) {
    var col1 = "C1";

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        var CAP1_R5000_F = values["CAP1_R5000_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP1_R5000_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP1_R5000_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP1_R5100_F = values["CAP1_R5100_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP1_R5100_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP2_R7100_F = values["CAP2_R7100_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP2_R7100_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP2_R7100_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP2_R7200_F = values["CAP2_R7200_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP2_R7200_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP2_R7200_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP2_R7300_F = values["CAP2_R7300_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP2_R7300_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP2_R7300_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP2_R7400_F = values["CAP2_R7400_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP2_R7400_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP2_R7400_" + col1 + "_FILIAL"][j])
            : 0;
        var CAP2_R7500_F = values["CAP2_R7500_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP2_R7500_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP2_R7500_" + col1 + "_FILIAL"][j])
            : 0;

        var calculatedSum_F = CAP1_R5100_F + CAP2_R7100_F + CAP2_R7200_F + CAP2_R7300_F + CAP2_R7400_F + CAP2_R7500_F;

        if (CAP1_R5000_F < calculatedSum_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R5000_' + col1 + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-014-F. Valoarea CAP.1 Rând.5000 col.1 trebuie să fie mai mare sau egala  cu suma valorilor: CAP1 Rând.5100 col.1, CAP2 Rând.7100 col.1, CAP2 Rând.7200 col.1, CAP2 Rând.7300 col.1, CAP2 Rând.7400 col.1 și CAP2 Rând.7500 col.1. Valoarea găsită: ' + CAP1_R5000_F + ', suma calculată: ' + calculatedSum_F, {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}


//----------------------------------------------------------------------



function validate_1800_C3(values) {
    var col3 = "C3";
    var col2 = "C2";

    var col_1800 = !isNaN(Number(values["CAP1_R1800_" + col3])) ? Number(values["CAP1_R1800_" + col3]) : 0;
    var col_1620 = !isNaN(Number(values["CAP1_R1620_" + col3])) ? Number(values["CAP1_R1620_" + col3]) : 0;
    var col_6100 = !isNaN(Number(values["CAP1_R6100_" + col2])) ? Number(values["CAP1_R6100_" + col2]) : 0;

    if (col_1800 !== (col_1620 + col_6100)) {
        webform.errors.push({
            'fieldName': 'CAP1_R1800_' + col3,
            'weight': 19,
            'msg': Drupal.t('Cod eroare: CAP1-001. Rând.1800 col.3 trebuie să fie egal cu suma Rând.1620 col.3 + Rând.6100 col.2. Valoarea rândului 1800: ' + col_1800 + ', suma calculată: ' + (col_1620 + col_6100))
        });
    }
}

function validate_1800_C3_F(values) {
    var col3 = "C3";
    var col2 = "C2";

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        var col_1800_F = values["CAP1_R1800_" + col3 + "_FILIAL"] && !isNaN(Number(values["CAP1_R1800_" + col3 + "_FILIAL"][j]))
            ? Number(values["CAP1_R1800_" + col3 + "_FILIAL"][j])
            : 0;
        var col_1620_F = values["CAP1_R1620_" + col3 + "_FILIAL"] && !isNaN(Number(values["CAP1_R1620_" + col3 + "_FILIAL"][j]))
            ? Number(values["CAP1_R1620_" + col3 + "_FILIAL"][j])
            : 0;
        var col_6100_F = values["CAP1_R6100_" + col2 + "_FILIAL"] && !isNaN(Number(values["CAP1_R6100_" + col2 + "_FILIAL"][j]))
            ? Number(values["CAP1_R6100_" + col2 + "_FILIAL"][j])
            : 0;

        if (col_1800_F !== (col_1620_F + col_6100_F)) {
            webform.errors.push({
                'fieldName': 'CAP1_R1800_' + col3 + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: CAP1-001-F. Rând.1800 col.3 trebuie să fie egal cu suma Rând.1620 col.3 + Rând.6100 col.2. Valoarea rândului 1800: ' + col_1800_F + ', suma calculată: ' + (col_1620_F + col_6100_F), {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}


//---------------------------------------------------------------

function validate_CUATM_FILIAL(values) {
    var seenCUATM = new Set(); // Set to track duplicates

    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = agr29GetCuatmDomValueByValidationIndex(j);
        if (CAP_CUATM_FILIAL === '') {
            CAP_CUATM_FILIAL = String(values.CAP_CUATM_FILIAL[j] || '').trim();
        } else {
            values.CAP_CUATM_FILIAL[j] = CAP_CUATM_FILIAL;
        }
        var CAP_NUM_FILIAL = Number(values.CAP_NUM_FILIAL[j]);

        // Check if CAP_NUM_FILIAL exists but CAP_CUATM_FILIAL is missing
        if (CAP_NUM_FILIAL && CAP_CUATM_FILIAL === "") {
            webform.errors.push({
                'fieldName': 'CAP_CUATM_FILIAL',
                'index': j,
                'weight': 20,
                'msg': Drupal.t('Raion: @CAP_NUM_FILIAL - Cod eroare: 45-020.  - Dacă există Nr. [@CAP_NUM_FILIAL], atunci trebuie să existe și cod CUATM.', {
                    '@CAP_NUM_FILIAL': CAP_NUM_FILIAL,
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }

        // Check for duplicate CAP_CUATM_FILIAL values
        if (CAP_CUATM_FILIAL) {
            if (seenCUATM.has(CAP_CUATM_FILIAL)) {
                webform.errors.push({
                    'fieldName': 'CAP_CUATM_FILIAL',
                    'index': j,
                    'weight': 10,
                    'msg': Drupal.t('Codul CUATM: @CAP_CUATM_FILIAL este duplicat. Fiecare cod CUATM trebuie să fie unic.', {
                        '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                    })
                });
            } else {
                seenCUATM.add(CAP_CUATM_FILIAL);
            }
        }
    }
}

//-----------------------------------------------------------

function validate45_013(values) {
    var col = "C1";
    var col_7740 = !isNaN(Number(values["CAP3_R7740_" + col])) ? Number(values["CAP3_R7740_" + col]) : 0;
    var col_7741 = !isNaN(Number(values["CAP3_R7741_" + col])) ? Number(values["CAP3_R7741_" + col]) : 0;

    if (col_7740 < col_7741) {
        webform.errors.push({
            'fieldName': 'CAP3_R7740_' + col,
            'weight': 19,
            'msg': Drupal.t('Cod eroare: 45-013. Rând.7740 col.1 trebuie să fie ≥ Rând.7741 col.1. Valoarea rândului 7740: ' + col_7740 + ', valoarea rândului 7741: ' + col_7741)
        });
    }
}

function validate45_013_F(values) {
    var col = "C1";
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);
        var col_7740_F = values["CAP3_R7740_" + col + "_FILIAL"] && !isNaN(Number(values["CAP3_R7740_" + col + "_FILIAL"][j]))
            ? Number(values["CAP3_R7740_" + col + "_FILIAL"][j])
            : 0;
        var col_7741_F = values["CAP3_R7741_" + col + "_FILIAL"] && !isNaN(Number(values["CAP3_R7741_" + col + "_FILIAL"][j]))
            ? Number(values["CAP3_R7741_" + col + "_FILIAL"][j])
            : 0;

        if (col_7740_F < col_7741_F) {
            webform.errors.push({
                'fieldName': 'CAP3_R7740_' + col + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-013-F. Rând.7740 col.1 trebuie să fie ≥ Rând.7741 col.1. Valoarea rândului 7740: ' + col_7740_F + ', valoarea rândului 7741: ' + col_7741_F, {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}

//-----------------------------------------------------------
// Validation function for CAP3: row 7640 col.1 ≥ row 7641 col.1
function validate45_012(values) {
    var col = "C1";
    var col_7640 = !isNaN(Number(values["CAP3_R7640_" + col])) ? Number(values["CAP3_R7640_" + col]) : 0;
    var col_7641 = !isNaN(Number(values["CAP3_R7641_" + col])) ? Number(values["CAP3_R7641_" + col]) : 0;

    if (col_7640 < col_7641) {
        webform.errors.push({
            'fieldName': 'CAP3_R7640_' + col,
            'weight': 19,
            'msg': Drupal.t('Cod eroare: 45-012. Rând.7640 col.1 trebuie să fie ≥ Rând.7641 col.1. Valoarea rândului 7640: ' + col_7640 + ', valoarea rândului 7641: ' + col_7641)
        });
    }
}

// Validation function for CAP3 FILIAL: row 7640 col.1 ≥ row 7641 col.1
function validate45_012_F(values) {
    var col = "C1";
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);
        var col_7640_F = values["CAP3_R7640_" + col + "_FILIAL"] && !isNaN(Number(values["CAP3_R7640_" + col + "_FILIAL"][j]))
            ? Number(values["CAP3_R7640_" + col + "_FILIAL"][j])
            : 0;
        var col_7641_F = values["CAP3_R7641_" + col + "_FILIAL"] && !isNaN(Number(values["CAP3_R7641_" + col + "_FILIAL"][j]))
            ? Number(values["CAP3_R7641_" + col + "_FILIAL"][j])
            : 0;

        if (col_7640_F < col_7641_F) {
            webform.errors.push({
                'fieldName': 'CAP3_R7640_' + col + '_FILIAL',
                'index': j,
                'weight': 19,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-012-F. Rând.7640 col.1 trebuie să fie ≥ Rând.7641 col.1. Valoarea rândului 7640: ' + col_7640_F + ', valoarea rândului 7641: ' + col_7641_F, {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}

//----------------------------------------------------------

// Validation function for CAP2: if col.2 = 0, then col.4 = 0; if col.2 ≠ 0, then col.4 ≠ 0 for all rows in CAP2
function validate45_011(values) {
    var rows = [7100, 7110, 7120, 7130, 7140, 7200, 7210, 7220, 7230, 7240, 7250, 7260,
        7300, 7310, 7320, 7330, 7400, 7410, 7420, 7430, 7440, 7450, 7460, 7470,
        7480, 7490, 7500, 7510, 7520]; // All rows from CAP2
    for (var row of rows) {
        var col2 = !isNaN(Number(values["CAP2_R" + row + "_C2"])) ? Number(values["CAP2_R" + row + "_C2"]) : 0;
        var col4 = !isNaN(Number(values["CAP2_R" + row + "_C4"])) ? Number(values["CAP2_R" + row + "_C4"]) : 0;

        if (col2 === 0 && col4 !== 0) {
            webform.errors.push({
                'fieldName': 'CAP2_R' + row + '_C2',
                'weight': 19,
                'msg': Drupal.t('Cod eroare: CAP2-001. Dacă col.2 = 0, atunci col.4 = 0. Rând: ' + row + ', col.2: ' + col2 + ', col.4: ' + col4)
            });
        }
        // else 
        // if (col2 !== 0 && col4 === 0) {
        //     webform.errors.push({
        //         'fieldName': 'CAP2_R' + row + '_C4',
        //         'weight': 19,
        //         'msg': Drupal.t('Cod eroare: 45-011. Dacă col.2 ≠ 0, atunci col.4 ≠ 0. Rând: ' + row + ', col.2: ' + col2 + ', col.4: ' + col4)
        //     });
        // }
    }
}


// Validation function for CAP2 FILIAL: if col.2 = 0, then col.4 = 0; if col.2 ≠ 0, then col.4 ≠ 0 for all rows in CAP2
function validate45_011_F(values) {
    var rows = [7100, 7110, 7120, 7130, 7140, 7200, 7210, 7220, 7230, 7240, 7250, 7260,
        7300, 7310, 7320, 7330, 7400, 7410, 7420, 7430, 7440, 7450, 7460, 7470,
        7480, 7490, 7500, 7510, 7520]; // All rows from CAP2
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var row of rows) {
            var col2_F = values["CAP2_R" + row + "_C2_FILIAL"] && !isNaN(Number(values["CAP2_R" + row + "_C2_FILIAL"][j]))
                ? Number(values["CAP2_R" + row + "_C2_FILIAL"][j])
                : 0;
            var col4_F = values["CAP2_R" + row + "_C4_FILIAL"] && !isNaN(Number(values["CAP2_R" + row + "_C4_FILIAL"][j]))
                ? Number(values["CAP2_R" + row + "_C4_FILIAL"][j])
                : 0;

            if (col2_F === 0 && col4_F !== 0) {
                webform.errors.push({
                    'fieldName': 'CAP2_R' + row + '_C2_FILIAL',
                    'index': j,
                    'weight': 19,
                    'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: CAP2-001-F. Dacă col.2 = 0, atunci col.4 = 0. Rând: ' + row + ', col.2: ' + col2_F + ', col.4: ' + col4_F, {
                        '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                    })
                });
            }

            // else if (col2_F !== 0 && col4_F === 0) {
            //     webform.errors.push({
            //         'fieldName': 'CAP2_R' + row + '_C4_FILIAL',
            //         'index': j,
            //         'weight': 19,
            //         'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-011-F. Dacă col.2 ≠ 0, atunci col.4 ≠ 0. Rând: ' + row + ', col.2: ' + col2_F + ', col.4: ' + col4_F, {
            //             '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
            //         })
            //     });
            // }
        }
    }
}

//-----------------------------------------------------------

// Validation function for CAP1: row 5000 col.1 ≥ row 5100 col.1
function validate45_010(values) {
    var col = "C1";
    var col_5000 = !isNaN(Number(values["CAP1_R5000_" + col])) ? Number(values["CAP1_R5000_" + col]) : 0;
    var col_5100 = !isNaN(Number(values["CAP1_R5100_" + col])) ? Number(values["CAP1_R5100_" + col]) : 0;

    if (col_5000 < col_5100) {
        webform.errors.push({
            'fieldName': 'CAP1_R5000_' + col,
            'weight': 6,
            'msg': Drupal.t('Cod eroare: 45-010. Rând.5000 col.1 trebuie să fie ≥ Rând.5100 col.1. Valoarea rândului 5000: ' + col_5000 + ', valoarea rândului 5100: ' + col_5100)
        });
    }
}

// Validation function for CAP1 FILIAL: row 5000 col.1 ≥ row 5100 col.1
function validate45_010_F(values) {
    var col = "C1";
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);
        var col_5000_F = values["CAP1_R5000_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R5000_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5000_" + col + "_FILIAL"][j])
            : 0;
        var col_5100_F = values["CAP1_R5100_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R5100_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R5100_" + col + "_FILIAL"][j])
            : 0;

        if (col_5000_F < col_5100_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R5000_' + col + '_FILIAL',
                'index': j,
                'weight': 6,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-010-F. Rând.5000 col.1 trebuie să fie ≥ Rând.5100 col.1. Valoarea rândului 5000: ' + col_5000_F + ', valoarea rândului 5100: ' + col_5100_F, {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}

//-----------------------------------------------------------
// Validation function for CAP1: row 1950 col.1 ≥ sum of rows 1951, 1952, and 1953 col.2
function validate45_009(values) {
    var col1 = "C1";
    var col2 = "C2";
    var col_1950 = !isNaN(Number(values["CAP1_R1950_" + col1])) ? Number(values["CAP1_R1950_" + col1]) : 0;
    var col_sum = 0;

    // Sum rows 1951, 1952, and 1953 for col.2
    for (var row = 1951; row <= 1953; row++) {
        col_sum += !isNaN(Number(values["CAP1_R" + row + "_" + col2])) ? Number(values["CAP1_R" + row + "_" + col2]) : 0;
    }

    if (col_1950 < col_sum) {
        webform.errors.push({
            'fieldName': 'CAP1_R1950_' + col1,
            'weight': 6,
            'msg': Drupal.t('Cod eroare: 45-009. Rând.1950 col.1 trebuie să fie ≥ suma rândurilor 1951+1952+1953 col.2. Valoarea rândului 1950 col.1: ' + col_1950 + ', suma calculată: ' + col_sum)
        });
    }
}

// Validation function for CAP1 FILIAL: row 1950 col.1 ≥ sum of rows 1951, 1952, and 1953 col.2
function validate45_009_F(values) {
    var col1 = "C1";
    var col2 = "C2";
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);
        var col_1950_F = values["CAP1_R1950_" + col1 + "_FILIAL"] && !isNaN(Number(values["CAP1_R1950_" + col1 + "_FILIAL"][j]))
            ? Number(values["CAP1_R1950_" + col1 + "_FILIAL"][j])
            : 0;
        var col_sum_F = 0;

        // Sum rows 1951, 1952, and 1953 for col.2
        for (var row = 1951; row <= 1953; row++) {
            if (values["CAP1_R" + row + "_" + col2 + "_FILIAL"] && !isNaN(Number(values["CAP1_R" + row + "_" + col2 + "_FILIAL"][j]))) {
                col_sum_F += Number(values["CAP1_R" + row + "_" + col2 + "_FILIAL"][j]);
            }
        }

        if (col_1950_F < col_sum_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R1950_' + col1 + '_FILIAL',
                'index': j,
                'weight': 6,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-009-F. Rând.1950 col.1 trebuie să fie ≥ suma rândurilor 1951+1952+1953 col.2. Valoarea rândului 1950 col.1: ' + col_1950_F + ', suma calculată: ' + col_sum_F, {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}

//------------------------------------------------------

// Validation function for CAP1: row 1490 col.2 ≥ sum of rows 1491 and 1492 col.2
function validate45_008(values) {
    var col = "C2";
    var col_1490 = !isNaN(Number(values["CAP1_R1490_" + col])) ? Number(values["CAP1_R1490_" + col]) : 0;
    var col_sum = 0;

    // Sum rows 1491 and 1492 for col.2
    for (var row = 1491; row <= 1492; row++) {
        col_sum += !isNaN(Number(values["CAP1_R" + row + "_" + col])) ? Number(values["CAP1_R" + row + "_" + col]) : 0;
    }

    if (col_1490 < col_sum) {
        webform.errors.push({
            'fieldName': 'CAP1_R1490_' + col,
            'weight': 6,
            'msg': Drupal.t('Cod eroare: 45-008. Rând.1490 col.2 trebuie să fie ≥ suma rândurilor 1491+1492 col.2. Valoarea rândului 1490: ' + col_1490 + ', suma calculată: ' + col_sum)
        });
    }
}

// Validation function for CAP1 FILIAL: row 1490 col.2 ≥ sum of rows 1491 and 1492 col.2
function validate45_008_F(values) {
    var col = "C2";
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);
        var col_1490_F = values["CAP1_R1490_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1490_" + col + "_FILIAL"][j]))
            ? Number(values["CAP1_R1490_" + col + "_FILIAL"][j])
            : 0;
        var col_sum_F = 0;

        // Sum rows 1491 and 1492 for col.2
        for (var row = 1491; row <= 1492; row++) {
            if (values["CAP1_R" + row + "_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R" + row + "_" + col + "_FILIAL"][j]))) {
                col_sum_F += Number(values["CAP1_R" + row + "_" + col + "_FILIAL"][j]);
            }
        }

        if (col_1490_F < col_sum_F) {
            webform.errors.push({
                'fieldName': 'CAP1_R1490_' + col + '_FILIAL',
                'index': j,
                'weight': 6,
                'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-008-F. Rând.1490 col.2 trebuie să fie ≥ suma rândurilor 1491+1492 col.2. Valoarea rândului 1490: ' + col_1490_F + ', suma calculată: ' + col_sum_F, {
                    '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                })
            });
        }
    }
}

//------------------------------------------------------
// Validation function for CAP1: row 1430 columns 1-4 ≥ row 1431 columns 1-4
function validate45_007(values) {
    var colNames = ["C1", "C2", "C3", "C4"];
    for (var col of colNames) {
        var col_1430 = !isNaN(Number(values["CAP1_R1430_" + col])) ? Number(values["CAP1_R1430_" + col]) : 0;
        var col_1431 = !isNaN(Number(values["CAP1_R1431_" + col])) ? Number(values["CAP1_R1431_" + col]) : 0;

        if (col_1430 < col_1431) {
            webform.errors.push({
                'fieldName': 'CAP1_R1430_' + col,
                'weight': 6,
                'msg': Drupal.t('Cod eroare: 45-007. Rând.1430 col. ' + col + ' ≥ Rând.1431 col. ' + col + '. Valoarea rândului 1430: ' + col_1430 + ', valoarea rândului 1431: ' + col_1431)
            });
        }
    }
}

// Validation function for CAP1 FILIAL: row 1430 columns 1-4 ≥ row 1431 columns 1-4
function validate45_007_F(values) {
    var colNames = ["C1", "C2", "C3", "C4"];
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var col of colNames) {
            var col_1430_F = values["CAP1_R1430_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1430_" + col + "_FILIAL"][j]))
                ? Number(values["CAP1_R1430_" + col + "_FILIAL"][j])
                : 0;
            var col_1431_F = values["CAP1_R1431_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1431_" + col + "_FILIAL"][j]))
                ? Number(values["CAP1_R1431_" + col + "_FILIAL"][j])
                : 0;

            if (col_1430_F < col_1431_F) {
                webform.errors.push({
                    'fieldName': 'CAP1_R1430_' + col + '_FILIAL',
                    'index': j,
                    'weight': 6,
                    'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-007-F. Rând.1430 col. ' + col + ' ≥ Rând.1431 col. ' + col + '. Valoarea rândului 1430: ' + col_1430_F + ', valoarea rândului 1431: ' + col_1431_F, {
                        '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                    })
                });
            }
        }
    }
}


// Validation function for CAP1: row 1240 columns 1-5 ≥ row 1241 columns 1-5
function validate45_006(values) {
    var colNames = ["C1", "C2", "C3", "C4", "C5"];
    for (var col of colNames) {
        var col_1240 = !isNaN(Number(values["CAP1_R1240_" + col])) ? Number(values["CAP1_R1240_" + col]) : 0;
        var col_1241 = !isNaN(Number(values["CAP1_R1241_" + col])) ? Number(values["CAP1_R1241_" + col]) : 0;

        if (col_1240 < col_1241) {
            webform.errors.push({
                'fieldName': 'CAP1_R1240_' + col,
                'weight': 6,
                'msg': Drupal.t('Cod eroare: 45-006. Rând.1240 col. ' + col + ' ≥ Rând.1241 col. ' + col + '. Valoarea rândului 1240: ' + col_1240 + ', valoarea rândului 1241: ' + col_1241)
            });
        }
    }
}

// Validation function for CAP1 FILIAL: row 1240 columns 1-5 ≥ row 1241 columns 1-5
function validate45_006_F(values) {
    var colNames = ["C1", "C2", "C3", "C4", "C5"];
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var col of colNames) {
            var col_1240_F = values["CAP1_R1240_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1240_" + col + "_FILIAL"][j]))
                ? Number(values["CAP1_R1240_" + col + "_FILIAL"][j])
                : 0;
            var col_1241_F = values["CAP1_R1241_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1241_" + col + "_FILIAL"][j]))
                ? Number(values["CAP1_R1241_" + col + "_FILIAL"][j])
                : 0;

            if (col_1240_F < col_1241_F) {
                webform.errors.push({
                    'fieldName': 'CAP1_R1240_' + col + '_FILIAL',
                    'index': j,
                    'weight': 6,
                    'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-006-F. Rând.1240 col. ' + col + ' ≥ Rând.1241 col. ' + col + '. Valoarea rândului 1240: ' + col_1240_F + ', valoarea rândului 1241: ' + col_1241_F, {
                        '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                    })
                });
            }
        }
    }
}


//------------------------------------------------------

// Validation function for CAP1: row 1230 columns 1-5 equals the sum of rows 1231 to 1236 columns 1-5
function validate45_005(values) {
    var colNames = ["C1", "C2", "C3", "C4", "C5"];
    for (var col of colNames) {
        var col_1230 = !isNaN(Number(values["CAP1_R1230_" + col])) ? Number(values["CAP1_R1230_" + col]) : 0;
        var col_sum = 0;

        // Sum rows 1231 to 1236 for the current column
        for (var row = 1231; row <= 1236; row++) {
            col_sum += !isNaN(Number(values["CAP1_R" + row + "_" + col])) ? Number(values["CAP1_R" + row + "_" + col]) : 0;
        }

        if (col_1230 !== col_sum) {
            webform.errors.push({
                'fieldName': 'CAP1_R1230_' + col,
                'weight': 6,
                'msg': Drupal.t('Cod eroare: 45-005. Rând.1230 col. ' + col + ' trebuie să fie egală cu suma rândurilor 1231-1236 col. ' + col + '. Valoarea rândului 1230: ' + col_1230 + ', suma calculată: ' + col_sum)
            });
        }
    }
}

// Validation function for CAP1 FILIAL: row 1230 columns 1-5 equals the sum of rows 1231 to 1236 columns 1-5
function validate45_005_F(values) {
    var colNames = ["C1", "C2", "C3", "C4", "C5"];
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var col of colNames) {
            var col_1230_F = values["CAP1_R1230_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1230_" + col + "_FILIAL"][j]))
                ? Number(values["CAP1_R1230_" + col + "_FILIAL"][j])
                : 0;
            var col_sum_F = 0;

            // Sum rows 1231 to 1236 for the current column
            for (var row = 1231; row <= 1236; row++) {
                if (values["CAP1_R" + row + "_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R" + row + "_" + col + "_FILIAL"][j]))) {
                    col_sum_F += Number(values["CAP1_R" + row + "_" + col + "_FILIAL"][j]);
                }
            }

            if (col_1230_F !== col_sum_F) {
                webform.errors.push({
                    'fieldName': 'CAP1_R1230_' + col + '_FILIAL',
                    'index': j,
                    'weight': 6,
                    'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-005-F. Rând.1230 col. ' + col + ' trebuie să fie egală cu suma rândurilor 1231-1236 col. ' + col + '. Valoarea rândului 1230: ' + col_1230_F + ', suma calculată: ' + col_sum_F, {
                        '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                    })
                });
            }
        }
    }
}

//------------------------------------------------------

//1
function validatePhoneNumber(phone) {
    // Check if the phone number is valid (exactly 9 digits)
    if (!phone || !/^[0-9]{9}$/.test(phone)) {
        webform.errors.push({
            'fieldName': 'PHONE',
            'weight': 29,
            'msg': concatMessage('A.09', '', Drupal.t('Introduceți doar un număr de telefon format din 9 cifre'))
        });
    }

    // Check if the first digit is 0
    if (phone && phone[0] !== '0') {
        webform.errors.push({
            'fieldName': 'PHONE',
            'weight': 30,
            'msg': concatMessage('A.09', '', Drupal.t('Prima cifră a numărului de telefon trebuie să fie 0'))
        });
    }
}

//2
function concatMessage(errorCode, fieldTitle, msg) {
    var titleParts = [];

    if (errorCode) {
        titleParts.push(getErrorMessage(errorCode));
    }

    if (fieldTitle) {
        titleParts.push(fieldTitle);
    }

    if (titleParts.length) {
        msg = titleParts.join(', ') + '. ' + msg;
    }

    return msg;
}

//3
function getErrorMessage(errorCode) {
    return Drupal.t('Error code: @error_code', { '@error_code': errorCode });
}

function row_45_CAP1(row) {
    var i;
    i = row;
    if (
        i == 1110 || i == 1120 || i == 1130 || i == 1140 || i == 1150 || i == 1160 || i == 1170 || i == 1180
        || i == 1190 || i == 1191 || i == 1210 || i == 1220 || i == 1230 || i == 1231 || i == 1232 || i == 1232
        || i == 1233 || i == 1234 || i == 1134 || i == 1235 || i == 1236 || i == 1240 || i == 1241
        || i == 1300 || i == 1400 || i == 1410 || i == 1420 || i == 1430 || i == 1431 || i == 1440 || i == 1450
        || i == 1460 || i == 1470 || i == 1480 || i == 1481 || i == 1482 || i == 1483 || i == 1484 || i == 1485
        || i == 1486 || i == 1490 || i == 1500 || i == 1900 || i == 1910 || i == 1920 || i == 1930 || i == 1940
        || i == 1950 || i == 1960

    )
        return true;
}


function row_45_CAP1_1610_1690(row) {
    var i;
    i = row;
    if (
        i == 1610 || i == 1620 || i == 1621 || i == 1622 || i == 1623 || i == 1624 || i == 1625 || i == 1626
        || i == 1627 || i == 1628 || i == 1629 || i == 1630 || i == 1631 || i == 1632 || i == 1633 || i == 1634
        || i == 1635 || i == 1636 || i == 1640 || i == 1650 || i == 1660 || i == 1670 || i == 1680
        || i == 1681 || i == 1682 || i == 1690

    )
        return true;
}


function row_45_CAP1_71_752(row) {
    var i;
    i = row;
    if (
        i == 7100 || i == 7110 || i == 7120 || i == 7130 || i == 7140 || i == 7200 || i == 7210 || i == 7220
        || i == 7230 || i == 7240 || i == 7250 || i == 7260 || i == 7300 || i == 7310 || i == 7320 || i == 7330
        || i == 7400 || i == 7410 || i == 7420 || i == 7430 || i == 7440 || i == 7450 || i == 7460
        || i == 7470 || i == 7480 || i == 7490 || i == 7500 || i == 7510 || i == 7520

    )
        return true;
}

function validate45_003(values) {
    for (var i = 7100; i <= 7520; i++) {
        if (row_45_CAP1_71_752(i)) {

            // Validation for column 1 and column 2
            var col1 = !isNaN(parseFloat(values["CAP2_R" + i + "_C1"])) ? parseFloat(values["CAP2_R" + i + "_C1"]) : 0;
            var col2 = !isNaN(parseFloat(values["CAP2_R" + i + "_C2"])) ? parseFloat(values["CAP2_R" + i + "_C2"]) : 0;

            col1 = roundToDecimal(col1, 1);
            col2 = roundToDecimal(col2, 1);

            if (col1 < col2) {
                webform.errors.push({
                    'fieldName': 'CAP2_R' + i + '_C1',
                    'weight': 6,
                    'msg': Drupal.t('Cod eroare: 45-003. [@col1] - col.1  ≥  col.2 - [@col2]', { "@col1": col1, "@col2": col2 })
                });
            }

            // Validation for column 3 and column 4
            var col3 = !isNaN(parseFloat(values["CAP2_R" + i + "_C3"])) ? parseFloat(values["CAP2_R" + i + "_C3"]) : 0;
            var col4 = !isNaN(parseFloat(values["CAP2_R" + i + "_C4"])) ? parseFloat(values["CAP2_R" + i + "_C4"]) : 0;

            col3 = roundToDecimal(col3, 1);
            col4 = roundToDecimal(col4, 1);

            if (col3 < col4) {
                webform.errors.push({
                    'fieldName': 'CAP2_R' + i + '_C3',
                    'weight': 6,
                    'msg': Drupal.t('Cod eroare: 45-003. [@col3] - col.3  ≥  col.4 - [@col4]', { "@col3": col3, "@col4": col4 })
                });
            }
        }
    }
}


function validate45_003_F(values) {
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var i = 7100; i <= 7520; i++) {
            if (row_45_CAP1_71_752(i)) {
                var col1_F = 0, col2_F = 0;
                var col3_F = 0, col4_F = 0;

                // Check if properties exist and are valid numbers for columns 1 and 2
                if (values["CAP2_R" + i + "_C1_FILIAL"] && !isNaN(Number(values["CAP2_R" + i + "_C1_FILIAL"][j]))) {
                    col1_F = Number(values["CAP2_R" + i + "_C1_FILIAL"][j]);
                }

                if (values["CAP2_R" + i + "_C2_FILIAL"] && !isNaN(Number(values["CAP2_R" + i + "_C2_FILIAL"][j]))) {
                    col2_F = Number(values["CAP2_R" + i + "_C2_FILIAL"][j]);
                }

                // Round to one decimal place
                col1_F = roundToDecimal(col1_F, 1);
                col2_F = roundToDecimal(col2_F, 1);

                // Validation: col1_F should be greater than or equal to col2_F
                if (col1_F < col2_F) {
                    webform.errors.push({
                        'fieldName': 'CAP2_R' + i + '_C1_FILIAL',
                        'index': j,
                        'weight': 6,
                        'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-003-F. [@row_FILIAL] - col.1(@col1_F) ≥ col.2(@col2_F)', {
                            '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL,
                            '@row_FILIAL': i,
                            '@col1_F': col1_F,
                            '@col2_F': col2_F
                        })
                    });
                }

                // Check if properties exist and are valid numbers for columns 3 and 4
                if (values["CAP2_R" + i + "_C3_FILIAL"] && !isNaN(Number(values["CAP2_R" + i + "_C3_FILIAL"][j]))) {
                    col3_F = Number(values["CAP2_R" + i + "_C3_FILIAL"][j]);
                }

                if (values["CAP2_R" + i + "_C4_FILIAL"] && !isNaN(Number(values["CAP2_R" + i + "_C4_FILIAL"][j]))) {
                    col4_F = Number(values["CAP2_R" + i + "_C4_FILIAL"][j]);
                }

                // Round to one decimal place
                col3_F = roundToDecimal(col3_F, 1);
                col4_F = roundToDecimal(col4_F, 1);

                // Validation: col3_F should be greater than or equal to col4_F
                if (col3_F < col4_F) {
                    webform.errors.push({
                        'fieldName': 'CAP2_R' + i + '_C3_FILIAL',
                        'index': j,
                        'weight': 6,
                        'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-003-F. [@row_FILIAL] - col.3(@col3_F) ≥ col.4(@col4_F)', {
                            '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL,
                            '@row_FILIAL': i,
                            '@col3_F': col3_F,
                            '@col4_F': col4_F
                        })
                    });
                }
            }
        }
    }
}




function validate45_001(values) {
    for (var i = 1110; i <= 1500; i++) {
        if (row_45_CAP1(i)) {

            // Validation for column 1 and column 2
            var col1 = !isNaN(Number(values["CAP1_R" + i + "_C1"])) ? Number(values["CAP1_R" + i + "_C1"]) : 0;
            var col2 = !isNaN(Number(values["CAP1_R" + i + "_C2"])) ? Number(values["CAP1_R" + i + "_C2"]) : 0;

            if (col1 < col2) {
                webform.errors.push({
                    'fieldName': 'CAP1_R' + i + '_C1',
                    'weight': 6,
                    'msg': Drupal.t('Cod eroare: 45-001. [@col1] - col.1  ≥  col.2 - [@col2]', { "@col1": col1, "@col2": col2 })
                });
            }

            // Validation for column 3 and column 4
            var col3 = !isNaN(Number(values["CAP1_R" + i + "_C3"])) ? Number(values["CAP1_R" + i + "_C3"]) : 0;
            var col4 = !isNaN(Number(values["CAP1_R" + i + "_C4"])) ? Number(values["CAP1_R" + i + "_C4"]) : 0;

            if (col3 < col4) {
                webform.errors.push({
                    'fieldName': 'CAP1_R' + i + '_C3',
                    'weight': 6,
                    'msg': Drupal.t('Cod eroare: 45-001. [@col3] - col.3  ≥  col.4 - [@col4]', { "@col3": col3, "@col4": col4 })
                });
            }
        }
    }
}


function validate45_002(values) {
    for (var i = 1610; i <= 1690; i++) {
        if (row_45_CAP1_1610_1690(i)) {

            // Validation for column 1 and column 2
            var col1 = !isNaN(parseFloat(values["CAP1_R" + i + "_C1"])) ? parseFloat(values["CAP1_R" + i + "_C1"]) : 0;
            var col2 = !isNaN(parseFloat(values["CAP1_R" + i + "_C2"])) ? parseFloat(values["CAP1_R" + i + "_C2"]) : 0;

            col1 = roundToDecimal(col1, 1);
            col2 = roundToDecimal(col2, 1);

            if (col1 < col2) {
                webform.errors.push({
                    'fieldName': 'CAP1_R' + i + '_C1',
                    'weight': 6,
                    'msg': Drupal.t('Cod eroare: 45-002. [@col1] - col.1  ≥  col.2 - [@col2]', { "@col1": col1, "@col2": col2 })
                });
            }

            // Validation for column 3 and column 4
            var col3 = !isNaN(parseFloat(values["CAP1_R" + i + "_C3"])) ? parseFloat(values["CAP1_R" + i + "_C3"]) : 0;
            var col4 = !isNaN(parseFloat(values["CAP1_R" + i + "_C4"])) ? parseFloat(values["CAP1_R" + i + "_C4"]) : 0;

            col3 = roundToDecimal(col3, 1);
            col4 = roundToDecimal(col4, 1);

            if (col3 < col4) {
                webform.errors.push({
                    'fieldName': 'CAP1_R' + i + '_C3',
                    'weight': 6,
                    'msg': Drupal.t('Cod eroare: 45-002. [@col3] - col.3  ≥  col.4 - [@col4]', { "@col3": col3, "@col4": col4 })
                });
            }
        }
    }
}


function validate45_001_F(values) {
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var i = 1110; i <= 1500; i++) {
            // Include the condition to filter rows using row_45_CAP1
            if (row_45_CAP1(i)) {
                var col1_F = 0, col2_F = 0;
                var col3_F = 0, col4_F = 0;

                // Check if properties exist and are valid numbers for columns 1 and 2
                if (values["CAP1_R" + i + "_C1_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C1_FILIAL"][j]))) {
                    col1_F = Number(values["CAP1_R" + i + "_C1_FILIAL"][j]);
                }

                if (values["CAP1_R" + i + "_C2_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C2_FILIAL"][j]))) {
                    col2_F = Number(values["CAP1_R" + i + "_C2_FILIAL"][j]);
                }

                // Validation: col1_F should be greater than or equal to col2_F
                if (col1_F < col2_F) {
                    webform.errors.push({
                        'fieldName': 'CAP1_R' + i + '_C1_FILIAL',
                        'index': j,
                        'weight': 6,
                        'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-001-F. [@row_FILIAL] - COL1(@col1_F) < COL2(@col2_F)', {
                            '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL,
                            '@row_FILIAL': i,
                            '@col1_F': col1_F,
                            '@col2_F': col2_F
                        })
                    });
                }

                // Check if properties exist and are valid numbers for columns 3 and 4
                if (values["CAP1_R" + i + "_C3_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C3_FILIAL"][j]))) {
                    col3_F = Number(values["CAP1_R" + i + "_C3_FILIAL"][j]);
                }

                if (values["CAP1_R" + i + "_C4_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C4_FILIAL"][j]))) {
                    col4_F = Number(values["CAP1_R" + i + "_C4_FILIAL"][j]);
                }

                // Validation: col3_F should be greater than or equal to col4_F
                if (col3_F < col4_F) {
                    webform.errors.push({
                        'fieldName': 'CAP1_R' + i + '_C3_FILIAL',
                        'index': j,
                        'weight': 6,
                        'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-001-F. [@row_FILIAL] - COL3(@col3_F) < COL4(@col4_F)', {
                            '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL,
                            '@row_FILIAL': i,
                            '@col3_F': col3_F,
                            '@col4_F': col4_F
                        })
                    });
                }
            }
        }
    }
}


function validate45_002_F(values) {
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var i = 1610; i <= 1690; i++) {
            if (row_45_CAP1_1610_1690(i)) {
                var col1_F = 0, col2_F = 0;
                var col3_F = 0, col4_F = 0;

                // Check if properties exist and are valid numbers for columns 1 and 2
                if (values["CAP1_R" + i + "_C1_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C1_FILIAL"][j]))) {
                    col1_F = Number(values["CAP1_R" + i + "_C1_FILIAL"][j]);
                }

                if (values["CAP1_R" + i + "_C2_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C2_FILIAL"][j]))) {
                    col2_F = Number(values["CAP1_R" + i + "_C2_FILIAL"][j]);
                }

                // Round to one decimal place
                col1_F = roundToDecimal(col1_F, 1);
                col2_F = roundToDecimal(col2_F, 1);

                // Validation: col1_F should be greater than or equal to col2_F
                if (col1_F < col2_F) {
                    webform.errors.push({
                        'fieldName': 'CAP1_R' + i + '_C1_FILIAL',
                        'index': j,
                        'weight': 6,
                        'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-002-F. [@row_FILIAL] - col.1(@col1_F) ≥ col.2(@col2_F)', {
                            '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL,
                            '@row_FILIAL': i,
                            '@col1_F': col1_F,
                            '@col2_F': col2_F
                        })
                    });
                }

                // Check if properties exist and are valid numbers for columns 3 and 4
                if (values["CAP1_R" + i + "_C3_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C3_FILIAL"][j]))) {
                    col3_F = Number(values["CAP1_R" + i + "_C3_FILIAL"][j]);
                }

                if (values["CAP1_R" + i + "_C4_FILIAL"] && !isNaN(Number(values["CAP1_R" + i + "_C4_FILIAL"][j]))) {
                    col4_F = Number(values["CAP1_R" + i + "_C4_FILIAL"][j]);
                }

                // Round to one decimal place
                col3_F = roundToDecimal(col3_F, 1);
                col4_F = roundToDecimal(col4_F, 1);

                // Validation: col3_F should be greater than or equal to col4_F
                if (col3_F < col4_F) {
                    webform.errors.push({
                        'fieldName': 'CAP1_R' + i + '_C3_FILIAL',
                        'index': j,
                        'weight': 6,
                        'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-002-F. [@row_FILIAL] - col.3(@col3_F) ≥ col.4(@col4_F)', {
                            '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL,
                            '@row_FILIAL': i,
                            '@col3_F': col3_F,
                            '@col4_F': col4_F
                        })
                    });
                }
            }
        }
    }
}
//----------------------------------------------


// Validation function for CAP1: row 1190 columns 1,2,3,4 ≥ row 1191 columns 1,2,3,4
function validate45_004(values) {
    var colNames = ["C1", "C2", "C3", "C4"];
    for (var col of colNames) {
        var col_1190 = !isNaN(Number(values["CAP1_R1190_" + col])) ? Number(values["CAP1_R1190_" + col]) : 0;
        var col_1191 = !isNaN(Number(values["CAP1_R1191_" + col])) ? Number(values["CAP1_R1191_" + col]) : 0;

        if (col_1190 < col_1191) {
            webform.errors.push({
                'fieldName': 'CAP1_R1190_' + col,
                'weight': 6,
                'msg': Drupal.t('Cod eroare: 45-004. Rând.1190 col. ' + col + ' ≥ Rând.1191 col. ' + col + '. Valoarea rândului 1190: ' + col_1190 + ', valoarea rândului 1191: ' + col_1191)
            });
        }
    }
}

// Validation function for CAP1 FILIAL: row 1190 columns 1,2,3,4 ≥ row 1191 columns 1,2,3,4
function validate45_004_F(values) {
    var colNames = ["C1", "C2", "C3", "C4"];
    for (var j = 0; j < values.CAP_NUM_FILIAL.length; j++) {
        var CAP_CUATM_FILIAL = isNaN(String(values.CAP_CUATM_FILIAL[j])) ? "" : String(values.CAP_CUATM_FILIAL[j]);

        for (var col of colNames) {
            var col_1190_F = values["CAP1_R1190_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1190_" + col + "_FILIAL"][j]))
                ? Number(values["CAP1_R1190_" + col + "_FILIAL"][j])
                : 0;
            var col_1191_F = values["CAP1_R1191_" + col + "_FILIAL"] && !isNaN(Number(values["CAP1_R1191_" + col + "_FILIAL"][j]))
                ? Number(values["CAP1_R1191_" + col + "_FILIAL"][j])
                : 0;

            if (col_1190_F < col_1191_F) {
                webform.errors.push({
                    'fieldName': 'CAP1_R1190_' + col + '_FILIAL',
                    'index': j,
                    'weight': 6,
                    'msg': Drupal.t('Raion: @CAP_CUATM_FILIAL - Cod eroare: 45-004-F. Rând.1190 col. ' + col + ' ≥ Rând.1191 col. ' + col + '. Valoarea rândului 1190: ' + col_1190_F + ', valoarea rândului 1191: ' + col_1191_F, {
                        '@CAP_CUATM_FILIAL': CAP_CUATM_FILIAL
                    })
                });
            }
        }
    }
}


//-----------------------------------------    
function roundToDecimal(value, decimals) {
    if (!isNaN(value)) {
        var factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    } else {
        console.warn("Value provided is not a number:", value);
        return 0; // Default fallback value
    }
}

// --------------------------------------------------
function sort_errors_warinings(a, b) {
    if (!a.hasOwnProperty('weight')) {
        a.error_code = 9999;
    }
    if (!b.hasOwnProperty('weight')) {
        b.error_code = 9999;
    }
    return toFloat(a.error_code) - toFloat(b.error_code);
}
