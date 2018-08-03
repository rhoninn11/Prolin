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
    constructor() {

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
    $('.New').on('click', OnAddNewParagraph)
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

    //czyszczenie modelu i sku
    $variantModel.val('');
    $variantSku.val('');

    $('.Table').show(150);
    $('.WantTable').show(150);

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
    let $parent = $(this).parent()
    let className = $parent.attr('class');
    let removedElementId = ExtractId(className, 'lb-list-index-');

    dataObj.variantsData.RemoveVariant(removedElementId);
    if (dataObj.variantsData.variantsCount < 1) {
        $('.Table').hide(150);
        $('.WantTable').hide(150);
    }
    let $mainList = $parent.parent().find('li');
    let $toModify = $mainList.slice(+removedElementId + 1);

    $parent.hide(150, function () {
        $(this).remove();

        $.each($toModify, function () {
            let id = ExtractId($(this).attr('class'), 'lb-list-index-');
            $(this).attr('class', `lb-list-index-${+id - 1}`);
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
        .addClass(`lb-p-${dataObj.paragraphData.paragraphsCounter}`);

    $newDR.append($newTa).append('\n').append($newDb);
    $newP.append($newVR).append('\n').append($newDR);

    $newP.hide();
    $('.New').before($newP);
    $newP.show(150);

    dataObj.paragraphData.AddParagraph();
    dataObj.hasParagrapshs = true;
}

function OnRemoveParagraph() {
    $p = $(this).parents('.Paragraph');
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