//#region CLASSES
class DataObject {
    constructor() {
        this.hasVariants = false;
        this.hasParagrapshs = false;
        this.hasTable = false;

        this.tableData = new Table();
        this.variantsData = new Variants();
        this.paragraphData = new Paragraphs();
    }
}

class Table {
    constructor(isRegular = true) {
        if (isRegular) {
            this.titleRow = new TableRow('Parametr', [new TableCell('all', 'Wartość')]);
        } else {
            this.titleRow = new TableRow('Model', []);
        }
        this.rows = []
    }

    AddRow(variants = []) {
        let newRow = new TableRow();
        for (let i = 0; i < variants.length; i++) {
            newRow.AddCell(variants[i].sku, '');
        }
        this.rows.push(newRow);
    }

    RemoveRow(index) {
        this.rows.splice(index, 1);
    }

    AddColumn(sku) {
        this.titleRow.Data[this.titleRow.Data.length] = sku;
        for (row in this.rows) {
            row.Data[row.Data.length] = '';
        }
    }

    RemoveColumn(sku) {
        let id = this.titleRow.Data.indexOf(sku);
        this.titleRow.Data.splice(id, 1);
        for (row in this.rows) {
            row.rowData.splice(id, 1);
        }
    }
}

class TableRow {
    constructor(title = '', rowData = []) {
        this.Title = title;
        this.Data = rowData;
    }

    AddCell(sku = 'all', value = '') {
        this.Data[this.Data.length] = new TableCell(sku, value);
    }

    RemoveCell(index) {
        this.Data.splice(index, 1);
    }
}

class TableCell {
    constructor(sku, value) {
        this.sku = sku;
        this.value = value;
    }

}

class Variants {
    constructor() {
        this.variantsCount = 0;
        this.variants = [];
    }

    AddVariant(model, sku) {
        this.variants[this.variantsCount] = new Variant(model, sku);
        this.variantsCount++;
    }

    RemoveVariant(index) {
        this.variantsCount--;
        this.variants.splice(index, 1);
    }
}

class Variant {
    constructor(model = 'all', sku = 'all') {
        this.model = model;
        this.sku = sku;
    }
}

class Paragraphs {
    constructor() {
        this.paragraphsCounter = 0;
        this.paragraphs = [];
    }

    AddParagraph() {
        this.paragraphs[this.paragraphsCounter] = new Paragraph();
        this.paragraphsCounter++;
    }

    RemoveParagraph(index) {
        if (this.paragraphsCounter >= 0) {
            this.paragraphsCounter--;
            this.paragraphs.splice(index, 1);
        }
    }
}

class Paragraph {
    constructor() {
        this.skus = ['all'];
        this.Data = '';
    }

    AddSku(newSku) {
        this.skus[this.skus.length] = newSku;
    }

    RemoveSku(sku) {
        this.skus.splice(this.skus.indexOf(sku), 1);
    }
}

//#endregion

let dataObj = new DataObject();

//#region INIT
function InitData() {
    dataObj = new DataObject();
}

function InitApp() {
    InitData();
    $(".SelectType").prop('value', 'none');
}
//#endregion

//#region UTILITIES
function ExtractId(id, prefix) {
    return id.replace(prefix, '')
}

//#endregion

$(document).ready(function () {
    InitApp();
    $(".SelectType").find('option').on('click', OnProductTypeChanged);
    $('.NewVariantBlock').find('.AddVariantButton').on('click', OnAddNewVariant);
    $('.New').on('click', OnAddNewParagraph);
    $('.AddParameterTable').on('click', OnAddTable);
    $('.RemoveParameterTable').on('click', OnRemoveTable);
    $('.NewParameter').on('click', OnAddTableRow);
})

//#region STATES
function NoneTypeState() {
    InitData();
    $('.Variants').hide(150);
    $('.Description').hide(150);
    $('.Table').hide(150);
    $('.WantTable').hide(150);
    $('.HaveTable').hide(150);
}

function RegularTypeState() {
    InitData();

    dataObj.paragraphData = new Paragraphs();

    $('.Variants').hide(150);
    $('.Description').show(150);
    $('.Table').show(150);
    $('.WantTable').show(150);
    $('.HaveTable').hide(150);
    $('.SelectType').attr('disabled', 'true');
}

function VariantTypeState() {
    InitData();

    dataObj.hasVariants = true;
    dataObj.variantsData = new Variants();
    dataObj.paragraphData = new Paragraphs();

    $('.Variants').show(150);
    $('.Description').show(150);
    $('.Table').hide(150);
    $('.WantTable').show(150);
    $('.HaveTable').hide(150);
    $('.TableDock').hide(150);
    $('.SelectType').attr('disabled', 'true');

}
//#endregion

function OnProductTypeChanged() {
    let typeId = $(this).val();
    console.log(typeId);

    if (typeId == 'regular') {
        RegularTypeState();
    } else if (typeId == 'variant') {
        VariantTypeState();
    } else if (typeId == 'none') {
        NoneTypeState();
    }
}

function OnAddNewVariant() {
    //wyszukanie potrzebnych elementów
    let $variantsList = $('.Variants').find('.VariantsList');
    let $variantSku = $('.NewVariantBlock').find('.SkuInput');
    let $variantModel = $('.NewVariantBlock').find('.ModelInput');

    //pobranie wpisanych danych
    let model = $variantModel.val();
    let sku = $variantSku.val();

    //dodanie wariantu w sekcji wprowadzania
    let $newListItem = $('<li></li>')
        .text(`${model} : ${sku} `)
        .attr('class', `lb-list-index-${dataObj.variantsData.variantsCount}`);

    let $newDeleteVariantButton = $('<input>')
        .attr('type', 'button')
        .attr('value', 'usuń')
        .on('click', OnRemoveVariant);

    $newListItem.append($newDeleteVariantButton).hide();
    $variantsList.append($newListItem);
    $newListItem.append($newDeleteVariantButton).show(150);

    //dodanie wariantu w modelu
    dataObj.variantsData.AddVariant(model, sku);
    console.log(`dodano model:${model} o sku:${sku}`);

    //czyszczenie modelu i sku
    $variantModel.val('');
    $variantSku.val('');

    $('.Table').show(150);
    $('.WantTable').show(150);

    //pojawienie się nowego warianów w opcjach dodanie do paragrafów
    let $toModify = $('.Paragraph').find('.VariantRow').find('ul');
    $.each($toModify, (index, item) => {
        let $select = $(item).children().last();
        let $options = $select.find('option');

        $.each($options, (index, item) => {

            if (index > 1) {
                $(item).remove();
            }
        });

        $.each(dataObj.variantsData.variants, (index, item) => {
            let $newOption = $(`<option value="${item.sku}">${item.model}</option>`)
                .on('click', OnAddVariantToParagraph);
            $select.append($newOption);
        });
    });
}

function OnRemoveVariant() {
    //dezaktywacja przycisku
    $(this).disabled = true;

    //pobranie ID
    let $parent = $(this).parents('li')
    let className = $parent.attr('class');
    let removedElementId = ExtractId(className, 'lb-list-index-');

    //model i sku usuwanego wariantu
    let model = dataObj.variantsData.variants[removedElementId].model;
    let sku = dataObj.variantsData.variants[removedElementId].sku;
    console.log(`usuwasz modelu:${model} o sku:${sku}`);

    //zabezpieczenie dla tabeli
    dataObj.variantsData.RemoveVariant(removedElementId);
    if (dataObj.variantsData.variantsCount < 1) {
        $('.Table').hide(150);
        $('.WantTable').hide(150);
        if (dataObj.hasTable) {
            OnRemoveTable();
        }
    } else {
        if (dataObj.hasTable) {
            //tu będzie usuwanie kolumny z tabeli wraz z wariantem
            let $toModify = $('.TableDock').find('table').find('tr');
            let $titleRow = $toModify.first();
            let ourCell = $.grep($titleRow.find('td'), function (item, index) {
                let classes = $(item).attr('class').split(' ');
                let result = classes.find((item) => {
                    return new RegExp(`${sku}`).test(item);
                });
                if (result != undefined) {
                    return true;
                } else {
                    return false;
                }
            });

            let result = $(ourCell).attr('class').split(' ').find((item) => /lb-/.test(item));
            let indexToRemove = ExtractId(result, 'lb-col-')
            console.log(indexToRemove);
            console.log($toModify);
            
            
            $.each($toModify, (index1, item1) => {
                console.log(item1);
                
                let $cells = $(item1).find('td');
                let $cellToModify = $cells.splice(+indexToRemove)
                console.log(indexToRemove);
                console.log($cells);
                console.log($cellToModify);
                
                $.each($cellToModify, (index2, item2) => {
                    console.log(item2);
                    
                    $(item2).removeClass(`lb-col-${+indexToRemove + index2}`).addClass(`lb-col-${+indexToRemove + index2 - 1}`);

                    if (index2 == 0) {
                        $(item2).hide(150, function () {
                            $(this).remove();
                        });
                    }

                });
            });
        }




    }

    //modyfikowanie id kolejnych wariantów aby zachować ciągłość
    let $mainList = $parent.parent().find('li');
    let $toModify = $mainList.slice(+removedElementId + 1);
    $.each($toModify, (index, item) => {

        let id = ExtractId($(item).attr('class'), 'lb-list-index-');
        $(item).attr('class', `lb-list-index-${+id - 1}`);
    });

    //usunięcie wariantu z listy
    $parent.hide(150, function () {
        $(this).remove();
    });

    //usunięcie wariantu z selectów oraz wariantów z paragrafów
    let $allp = $('.Paragraph');
    $.each($allp, function (id, item) {
        let $variantBlock = $(item).find(`.${sku}`);
        if ($variantBlock.length > 0) {

            let classes = $(item).attr('class').split(' ');
            let result = classes.find((classInstance) => /lb-/.test(classInstance));
            let index = ExtractId(result, 'lb-p-');

            console.log(`usuwamy sku:${sku} z paragrafu o indexie: ${index}`);

            dataObj.paragraphData.paragraphs[index].RemoveSku(sku);
            $variantBlock.hide(150, function () {
                $(this).remove()
            });
        }
    });

    $toModify = $('.Paragraph').find('.VariantRow').find('ul');
    $.each($toModify, (index, item) => {
        let $select = $(item).children().last();
        let $options = $select.find('option');

        $.each($options, (index, item) => {
            if (index > 1) {
                $(item).remove();
            }
        });

        $.each(dataObj.variantsData.variants, (index, item) => {
            let $newOption = $(`<option value="${item.sku}">${item.model}</option>`)
                .on('click', OnAddVariantToParagraph);
            $select.append($newOption);
        });
    });
}

function OnAddNewParagraph() {

    let $newTa = $('<textarea></textarea>')
        .attr('class', 'Field')
        .on('input', OnParagraphInput);

    let $newDb = $('<input>')
        .attr('class', 'Delete')
        .attr('type', 'button')
        .attr('value', 'usuń')
        .on('click', OnRemoveParagraph);
    //.on('click',OnDeleteParagraph);

    let $newDR = $('<div></div>')
        .attr('class', 'DataRow')

    let $newVR = $('<div></div>')
        .attr('class', 'VariantRow')
    if (dataObj.hasVariants) {

        let $newUl = $('<ul></ul>');
        let $newLi = $('<li class="all"><p>Wszystkie</p></li>');
        let $newCross = $('<span>x</span>')
            .on('click', OnDeleteVariantFromParagraph);
        $newLi.append($newCross);
        $newUl.append($newLi);

        $newSel = $('<select></select>')
            .addClass('selectOne');
        $newSel.append($('<option></option>')
            .val('none')
            .text('dodaj nowy model')
            .attr('style', 'display: none;'));

        $newSel.append($('<option></option>')
            .val('all')
            .text('wszystkie'));

        for (let variant of dataObj.variantsData.variants) {
            console.log(variant);
            $newSel.append($('<option></option>')
                .val(variant.sku)
                .text(variant.model));
        }
        $newSel.find('option').on('click', OnAddVariantToParagraph);
        $newVR.append($newUl);
        $newUl.append($newSel);
    }

    let $newP = $('<div></div>')
        .addClass('Paragraph')
        .addClass(`lb-p-${dataObj.paragraphData.paragraphsCounter}`)


    $newDR.append($newTa).append('\n').append($newDb);
    $newP.append($newVR).append('\n').append($newDR);

    $newP.hide();
    $('.New').before($newP);
    $newP.show(150);

    dataObj.paragraphData.AddParagraph();
    dataObj.hasParagrapshs = true;

    console.log('dodano paragraf');
}

function OnRemoveParagraph() {
    $p = $(this).parents('.Paragraph');
    console.log($p);

    let classes = $p.attr('class').split(' ');
    let result = classes.find((item) => /lb-/.test(item));
    let index = ExtractId(result, 'lb-p-');

    $allP = $p.parent().find('.Paragraph');
    $toModify = $allP.splice(+index + 1)
    $p.hide(150, function () {
        $(this).remove();
        dataObj.paragraphData.RemoveParagraph(index);

        $.each($toModify, function (id, item) {
            let classes = $(item).attr('class').split(' ');
            let result = classes.find((item) => /lb-/.test(item));
            let index = ExtractId(result, 'lb-p-');
            $(item).removeClass(`lb-p-${+index}`).addClass(`lb-p-${+index-1}`);
        });

    })

}

function OnAddVariantToParagraph() {
    let $selectEl = $(this).parent();
    $selectEl.val('none');
    let sku = $(this).val();
    let model = $(this).text();

    let $list = $selectEl.parent().children('li');

    let isInTheList = -1;
    $.each($list, function (index, item) {
        let itemClass = $(item).attr('class');

        if (itemClass == sku) {
            console.log(`elo ${index}`);
            isInTheList = index;
        }
    })

    if (isInTheList > -1) {
        return;
    }

    let $newLi = $(`<li class="${sku}"><p>${model}</p></li>`);
    let $newCross = $('<span>x</span>')
        .on('click', OnDeleteVariantFromParagraph);
    $newLi.append($newCross).hide();
    $selectEl.before($newLi);
    $newLi.show(150);

    $p = $selectEl.parents('.Paragraph');
    let classes = $p.attr('class').split(' ');
    let result = classes.find((item) => /lb-/.test(item));
    let index = ExtractId(result, 'lb-p-');
    console.log(index);
    dataObj.paragraphData.paragraphs[index].AddSku(sku);
    console.log(dataObj);
}

function OnDeleteVariantFromParagraph() {
    $variant = $(this).parent();
    let sku = $variant.attr('class');
    let model = $variant.find('p').text();

    $p = $(this).parents('.Paragraph');
    let classes = $p.attr('class').split(' ');
    let result = classes.find((item) => /lb-/.test(item));
    let index = ExtractId(result, 'lb-p-');

    console.log(`próbujesz usunąć model: ${model} o sku:${sku} z paragrafu o indexie: ${index}`);

    dataObj.paragraphData.paragraphs[index].RemoveSku(sku);
    $variant.hide(150, function () {
        $(this).remove();
    })
    console.log(dataObj);

}

function OnParagraphInput() {
    $p = $(this).parents('.Paragraph');
    let classes = $p.attr('class').split(' ');
    let result = classes.find((item) => /lb-/.test(item));
    let index = ExtractId(result, 'lb-p-');

    dataObj.paragraphData.paragraphs[index].Data = $(this).val();
}

function OnAddTable() {
    $('.AddParameterTable').hide(150);
    $('.AddParameterTable').disabled = true;
    $('.RemoveParameterTable').disabled = true;
    dataObj.hasTable = true;
    if (dataObj.hasVariants) {
        dataObj.tableData = new Table(false);
    } else {
        dataObj.tableData = new Table();
    }
    OnAddTableRow();

    $('.RemoveParameterTable').show(150, function () {
        $('.RemoveParameterTable').disabled = false;
    });
    $('.TableDock').show(300);
    $('.HaveTable').show(150);
}

function OnRemoveTable() {
    $('.RemoveParameterTable').hide(150);
    $('.RemoveParameterTable').disabled = true;
    $('.AddParameterTable').disabled = true;

    $('.AddParameterTable').show(150);
    $('.TableDock').hide(150, function () {
        $(this).find('table').remove();
        dataObj.hasTable = false;
        dataObj.tableData = null;
        $('.AddParameterTable').disabled = false;
    });
    $('.HaveTable').hide(150);
}

function OnAddTableRow() {
    let $table = $('.TableDock').find('table');
    console.log('elo1');

    //dodawanie widoku tabeli do wrowadzanie i uzupełnianie modelu o potrzebne dane gdy widoku tabeli nie ma
    if ($table.length == 0) {
        $table = $('<table></table>');
        if (dataObj.hasVariants) {
            //produkt z wariantami
            let $newRow = $(`<tr></tr>`).addClass('lb-row-0');
            let $newCell = $(`<td>${dataObj.tableData.titleRow.Title}</td>`)
                .addClass('lb-col-0')

            $newRow.append($newCell);

            //przygotowanie komórek dla wszystkich wariantów
            $.each(dataObj.variantsData.variants, function (index, item) {
                let $newCell = $(`<td>${item.model}</td>`)
                    .addClass(`lb-col-${index+1}`)
                    .addClass(`${item.sku}`);

                $newRow.append($newCell);
                console.log($newCell.attr('class'));

                //dodawanie komórek w modelu
                dataObj.tableData.titleRow.AddCell(item.sku, item.model);
            });

            $table.append($newRow);
        } else {
            //produkt regularny
            let $newRow = $(`<tr></tr>`).addClass('lb-row-0');
            $newRow.append($(`<td>${dataObj.tableData.titleRow.Title}</td>`)
                .addClass('lb-col-0'));

            $newRow.append($(`<td>${dataObj.tableData.titleRow.Data[0].value}</td>`)
                .addClass('lb-col-1')
                .addClass(`${dataObj.tableData.titleRow.Data[0].sku}`));

            $table.append($newRow);
        }
        $('.TableDock').append($table);
    }

    //dodawanie nowego wiersza do widoku jak i do modelu
    let $newRow = $('<tr></tr>')
        .addClass(`lb-row-${dataObj.tableData.rows.length + 1}`);

    //dodanie komórki od nazwy parametru
    $newRow.append($('<td></td>')
        .addClass(`lb-col-0`)
        .append($('<input class="TableInput" type="text">')));

    if (dataObj.hasVariants) {
        //produkt z wariantami
        $.each(dataObj.variantsData.variants, function (index, item) {
            //dadawanie widoku dla każdej komórki
            let $newCell = $('<td></td>')
                .addClass(`lb-col-${index+1}`)
                .append($('<input class="TableInput" type="text">'));
            $newRow.append($newCell);
        });
        //dodawanie do modelu komórek na podstawie wariantów
        dataObj.tableData.AddRow(dataObj.variantsData.variants);
    } else {
        $newRow.append($('<td></td>')
            .addClass(`lb-col-1`)
            .append($('<input class="TableInput" type="text">')));
        //dodanie do modelu wiersza i tu się dowiedziałem że nie ma w js czegoś takiego jak przeładowanie funkcji
        dataObj.tableData.AddRow([new Variant('', 'all')]);
    }
    $newRow.hide();
    $table.append($newRow);
    $newRow.show(150);


}


function OnTableInput() {

}