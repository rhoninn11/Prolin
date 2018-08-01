//klasa danych dla apikacji, można powiedzieć że model
class DescriprionData {

    constructor(isVariant = false){
        this.hasList = false;
        this.hasTable = false;

        this.isVariant = isVariant;
        this.variantCounter = 0;
        this.VariantData = [];
        this.pragraphCounter = 0;
        this.paragraphData = [];
        this.table = new Table(0)
        if(!isVariant)
        {
            this.table = new Table(1);
            this.table.atttibs.push(new TableAttr());
        }
    }

    InitData(){
        console.log("elo data");
    }
     
};

//klasa danych wariantu
class Variant {
    constructor(sku,model){
        this.variantSku = sku;
        this.variantModelName = model;
    }
}
//klasa tabeli
class Table{
     constructor(columnsCount)
     {
         this.columns = columnsCount;
         this.atttibs = []
     }
}

//klasa atrybutu tabeli
class TableAttr {
    constructor(name = 'Parametr', value=['Wartość'],sku =['all']){
        this.attrName = name;
        this.attrValue = value;
        this.attrSku = sku;
    }
}

// Dane naszej aplikacji
let dataObj;

// Funkcja inicjalizacyjna
// TODO
//  + Ustawianie selecta na domyślnej pozycji
function InitApp() {
    InitData();
    $(".SelectType").prop('value','none');
    
    console.log('elo');
    
}
function InitData(isVariant) {
    dataObj = new DescriprionData(isVariant);
}

// Funkcja obsługująca usuwanie paragrafów
// TODO:
//  + wybieranie id
//  - usuwanie paragrafu
//  - usuwanie sekcji widoku
//  - aktualizacja modelu
//
function OnDeleteParagraph(){
    let id = $(this).parent().attr('id');
    
    console.log(id);
}

// Obsługa wprowadzania tekstu do paragrafów
// TODO
//  + pobranie tekstu z paragrafu
//  + uaktualnianie widoku
//  + uaktualnianie modelu
function OnInputParagraph(){
    //pobranie tekstu z Field który jest w środku .Paragraph
    let id = $(this).attr('id');
    let $field = $(this).children(".Field");    
    let data = $field.val();
    id = ExtractId(id,'lb-p-');
    
    //uaktualnienie widoku
    let viewPrefix = 'lb-view-span-';
    let viewSpanId = '#' + viewPrefix + id;
    $(viewSpanId).text(data);
    
    dataObj.paragraphData[id] = data;
}

// Metoda ekstraktuje id z nazwy klasy która składa się z prefixa oraz id
function ExtractId(id,prefix)
{
    return  id.replace(prefix,'')
}

// Obsługa dodania nowego paragrafu
// TODO
//  + dodanie nowego paragrafu ze wszystkimi jego elementami
//  + dodanie nowego widoku dla pragrafu
//  - dodanie nowego zkompilowanego html dla pragrafu
function OnAddNewParagraph(){
    
    
    AddNewParagraphView(dataObj.pragraphCounter-1)
    
    let $newTa = $('<textarea></textarea>')
    .attr('class','Field');
    
    let $newDb = $('<input>')
    .attr('class','Delete')
    .attr('type','button')
    .attr('value','usuń')
    .on('click',OnDeleteParagraph);
    
    let $newP = $('<div></div>')
    .attr('class','Paragraph')
    .attr('id',"lb-p-" + dataObj.pragraphCounter)
    .on('input', OnInputParagraph);
    
    $newP.append($newTa).append('\n').append($newDb);

    $newP.hide();
    $('.New').before($newP);
    $newP.show(300);

    
    dataObj.pragraphCounter++;
        
}
// Funkcja dodająca nowy widok dla pragrafu
function AddNewParagraphView(beforeId){
    let prefix = 'lb-view-span-';
    let id = '#'+ prefix + beforeId;
    let $newSpan = $('<span></span>')
    .attr('id', prefix + (beforeId + 1));
    $(id).after($newSpan).after('<hr>');
}

function InitDefaultState() {
    InitData();
    $('.Variants').hide(300);
    $('.Description').hide(300);
    $('.VariantsList').empty(); 
    $('.Table').hide(300);
    $('.RemoveParameter').hide(300);
}

//Obsługa zmiany typu produktu
function OnProductTypeChanged(){
    let valId = $(this).val();
    console.log(valId); 
    
    if(valId == 0)
    {
        InitData(false);
        $('.Variants').hide(300);
        $('.Description').show(300);
        $('.VariantsList').empty();
        $('.Table').show(300);
        $('.RemoveParameter').hide(300);
        $('.WantTable').show(300);
        TableController.TableReInit();
        
    }
    else if (valId == 1)
    {
        InitData(true);
        $('.Variants').show(300);
        $('.Description').show(300);
        $('.Table').show(300);
        $('.RemoveParameter').hide(300);
    }
    else if (valId == 'none')
    {
        InitDefaultState();
    }

}

function OnAddNewVariant() {
    let $variantsList = $('.Variants').find('.VariantsList');
    let $variantSku = $('.NewVariantBlock').find('.SkuInput');
    let $variantModel = $('.NewVariantBlock').find('.ModelInput');

    //pobranie wpisanych danych
    let model = $variantModel.val();
    let sku = $variantSku.val();

    //dodanie variantu w modelu
    $variantsList.append($('<li></li>').text(`${model} : ${sku}`));

    dataObj.VariantData[dataObj.VariantData.length] = new Variant(sku,model);
    dataObj.variantCounter++;
    dataObj.table = new Table(dataObj.variantCounter);

    //dodawanie warantu w tabeli
    let modelBuffor = [];
    let skuBuffor = [];
  
    for(let given of dataObj.VariantData){
        
        modelBuffor.push(given.variantModelName);
        skuBuffor.push(given.variantSku);
    }

    dataObj.table = new Table(dataObj.variantCounter);
    dataObj.table.atttibs.push(new TableAttr('Parametry',modelBuffor,skuBuffor));

    TableController.TableReInit();


    if(dataObj.VariantData.length>=1){
        $('.WantTable').show(300);
    }
    else{
        $('.WantTable').hide(300);
    }
    
    // do listy dodać nowy element 
    // uaktualnić model
}

class TableController{

    //płynna reinicjaca tabeli
    static TableReInit(){
        if(dataObj.hasTable){
            $('.Table').hide(150,'swing',function(){
                $('.Table').find('table').remove();
                TableController.AddTableInput();
                $('.Table').show(250);
            });
        } 
    }

    static AddTableInput() {
        let $afterTable = $('.NewParameter');
    
        let $row = $('<tr></tr>').attr('class','lb-input-table-row-0');
        
        if(dataObj.isVariant)
        {
            $row.append($('<td></td>').text(dataObj.table.atttibs[0].attrName));
            for(let i = 0; i < dataObj.table.columns; i++ )
            {
                $row.append($('<td></td>').text(dataObj.table.atttibs[0].attrValue[i]));
            }
        }
        else{
            $row.append($('<td></td>').text(dataObj.table.atttibs[0].attrName));
            $row.append($('<td></td>').text(dataObj.table.atttibs[0].attrValue[0]));
        }
        
        $afterTable.before($('<table></table>').append($('<tbody></tbody>').append($row)));
    }

    static AddTableRow(){
        let $tBody = $('.Table >table >tbody');
        let rowCount = $('.Table >table >tbody >tr').length;

        let $newRow = $('<tr></tr>').attr('class',`lb-input-table-row-${rowCount}`);

        if(dataObj.isVariant)
        {
            let $newCell = $('<input>').attr('class','lb-input-cell-index-0').attr('type','text'); 
            $newRow.append($('<td></td>').append($newCell));
            for(let i = 1; i < dataObj.table.columns + 1; i++)
            {
                let $newCell = $('<input>').attr('class',`lb-input-cell-index-${i}`).attr('type','text'); 
                $newRow.append($('<td></td>').append($newCell));
            }

        }
        else{
            let $newCell = $('<input>').attr('class','lb-input-cell-index-0').attr('type','text'); 
            $newRow.append($('<td></td>').append($newCell));
            $newCell = $('<input>').attr('class','lb-input-cell-index-1').attr('type','text'); 
            $newRow.append($('<td></td>').append($newCell));
        }

        //dodanie wiersza w tablicy oraz efektowna animacja
        $newRow.hide();
        $tBody.append($newRow);
        $newRow.show(150);

        //dodanie atrybutu do modelu
        let skuBuffor = [];
        let valueBuffor = []
        
        for(let given of dataObj.VariantData){

            valueBuffor.push('');
            skuBuffor.push(given.variantSku);
        }
        dataObj.table.atttibs.push(new TableAttr('',valueBuffor,skuBuffor));

        //uaktywnienie przycisku umożliwającego usuwanie atrybutów
        $('.RemoveParameter').show(150);
    }

    static RemoveTableRow(){
        dataObj.table.atttibs.pop();

        let $lastRow = $('.Table >table >tbody >tr').last();
        if(dataObj.table.atttibs.length<2)
        {
            $('.RemoveParameter').hide(150,function(){
                $lastRow.hide(150,function(){
                    $lastRow.remove();
                });
            });
        }
        else{
            $lastRow.hide(150,function(){
                $lastRow.remove();
            });
        }
    }
}


$(document).ready(function(){

    InitApp();

    $(".Paragraph").on('input',OnInputParagraph);
    $(".New").on('click',OnAddNewParagraph);
    $('.Delete').on('click',OnDeleteParagraph);
    
    $('.NewVariantBlock').find('.AddVariantButton').on('click', OnAddNewVariant);
    $('.NewParameter').on('click', TableController.AddTableRow);
    $('.RemoveParameter').on('click', TableController.RemoveTableRow);
    $('.AddParameterTable').on('click',function() {
        //add table
        $(this).hide(300);
        $('.RemoveParameterTable').show(300);
        $('.HaveTable').show(300);
        dataObj.hasTable = true;
        TableController.TableReInit();
    });
    $('.RemoveParameterTable').on('click',function() {
        //add table
        $(this).hide(300);
        $('.AddParameterTable').show(300);
        $('.HaveTable').hide(300);

        dataObj.hasTable = false;

    })

    dataObj.InitData();
})



