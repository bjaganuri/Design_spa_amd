$(document).ready(function(){
    var elements = [
                    {name:"a" , attributes:{href:"https://www.google.com" , title:"Test Link" , innerHTML:"Test Link" , class:'link' }},
                    {name:"div" , attributes:{title:"Test Element" , innerHTML:"Test div"}},
                    {name:"button" , attributes:{class:"btn btn-primary" , title:"Test Element" , innerHTML:"Test button"}},
                    {name:"input" , attributes:{type:["text" , "email" , "password" , "button" , "checkbox" , "radio" , "submit" , "reset"] , name:"Test element" , value:"Test"}},
                    {name:"table" , attributes:{border:"1" , cellspacing:"0" , class:'table table-responsive table bordered'} , childrens:{type:'tr' , rows:4 , col:4 , innerHTML:"Test table"}},
                    {name:"textarea" , attributes:{rows:10 , cols:10 , name:"test" , value:"Test text area"}},
                    {name:"ul" , childrens:{count:5 , type:'li' , innerHTML:"Test Li"}},
                    {name:"ol" , childrens:{count:5 , type:'li' , innerHTML:"Test Li"}},
                    {name:"img" , attributes:{src:"images/image1.png" , alt:"Test image"}},
                    {name:"p" , attributes:{innerHTML:"Test P"}},
                    {name:"span" , attributes:{innerHTML:"Test span"}}
                ];
                    
    var defautlStyles = ["height" , "width" , "margin" , "padding" , "color" , "border" , "float" , "display" , "position" , "left" , "right","top" , "bottom" , "z-index"];
    var defautlStyleObject = window.getComputedStyle(document.body);
    var elemDefaultStyle = {};

    var currentPathName = window.location.pathname;

    $(document.body).tooltip({
        selector:"[data-toggle='tooltip']"
    });

    $(".copyBtn").on("click" , function(){
        copyElement($(".element-container").children($("#elements").val()).not(".addCpyBtn")[0] , "E");
    });

    for(var i=0; i<=elements.length; i++){
        var option = document.createElement("option");
        if(i==0){
            option.innerText = "--Select--";
        }
        else{
            option.value = elements[i-1].name;
            option.name = "elements";
            option.innerText = elements[i-1].name;
            if(i==3){
               option.selected = true; 
            }
        }
        $("#elements").append(option);
    }

    var elemStyles = window.getComputedStyle(createDOMElement($("#elements")[0]));
    
    if(currentPathName.toString().replace("/" , "") == "designElement"){
        $(".style-container").children(":not(.addCpyBtn)").remove();
        [].forEach.call(defautlStyles , addStyle , elemStyles);
    }            

    $("#elements").on("change" , function(e){
        var element = createDOMElement(this);
        
        if(currentPathName.toString().replace("/" , "") == "designLayout"){
            
        }
        else if(currentPathName.toString().replace("/" , "") == "designElement"){          
            $(".style-container").children(":not(.addCpyBtn)").remove();
            [].forEach.call(defautlStyles , addStyle , window.getComputedStyle(element));
        } 

        var newElement = $(".element-container").children()[1];
        if(newElement.tagName == "IMG" && (newElement.getBoundingClientRect().height == 0 || newElement.getBoundingClientRect().width == 0)){
            newElement.onload = function() {
                newElement.style.height = newElement.naturalHeight+"px";
                newElement.style.width = newElement.naturalWidth+"px";
                [].forEach.call(["height","width"] , addStyle , {height:newElement.style.height , width:newElement.style.width});
            }
        } 
    });

    function createDOMElement(context){
        if(context.value !== "--Select--"){
            var elementIndex = $('#elements')[0].selectedIndex;
            var element = document.createElement(elements[elementIndex-1].name);
            element.id = (new Date()).getTime();
            var attrList;
            $(".attrList").remove();
        
            if(elements[elementIndex-1].hasOwnProperty('attributes')){
                for(var key in elements[elementIndex-1].attributes){
                    if(Array.isArray(elements[elementIndex-1].attributes[key])) {
                        element[key] = elements[elementIndex-1].attributes[key][0];
                        attrList = document.createElement('select');
                        attrList.setAttribute("class" , "attrList");
                        var option;
                        elements[elementIndex-1].attributes[key].forEach(function(attr){
                            option = document.createElement('option');
                            option.value = attr;
                            option.innerHTML = attr;
                            $(attrList).append(option);
                        });
                    }
                    else{
                        // element[key] = elements[elementIndex-1].attributes[key];
                        $(element).prop(key , elements[elementIndex-1].attributes[key]);
                    }
                }
            }
            if(elements[elementIndex-1].hasOwnProperty('childrens')){
                switch (elements[elementIndex-1].name){
                    case 'ul':
                    case 'ol': {
                       for(var i=0; i < elements[elementIndex-1].childrens.count ; i++){
                            var child = document.createElement(elements[elementIndex-1].childrens.type);
                            child.innerText = elements[elementIndex-1].childrens.innerHTML;
                            $(element).append(child);
                        }
                        break;
                    }
                    case 'table' : {
                        for(var i=0; i < elements[elementIndex-1].childrens.rows ; i++){
                            var row = document.createElement(elements[elementIndex-1].childrens.type);
                            for(var j=0 ; j<elements[elementIndex-1].childrens.rows ; j++){
                                var td = document.createElement('td');
                                td.innerHTML = elements[elementIndex-1].childrens.innerHTML;
                                $(row).append(td)
                            }                            
                            $(element).append(row);
                        }
                        break;
                    }
                }
            }

            if(currentPathName.toString().replace("/" , "") == "designLayout"){
                element.setAttribute("draggable" , true);

                element.addEventListener("dragstart" , function(event){
                    dragStart(event);
                });
            }

            $(".element-container").children()[1] == undefined ? $(".element-container").append(element) : $($(".element-container").children()[1]).replaceWith(element);
            attrList ? $(".element-container").append(attrList) : null;

            $(attrList).on('change' , function(){
                $(element).attr("type" , this.value);
                $(element).removeAttr("style");
                $(".style-container").html("");
                [].forEach.call(defautlStyles , addStyle , window.getComputedStyle(element));
            });
        }
        return element;
    }

    function addStyle(prop){
        var context;
        var tempObj = {};
        if(typeof prop == 'object'){
            context = prop;
            prop = Object.keys(prop)[0];
        }
        else
            context = this;
        var elemStyle = createStyleObject($(".element-container").children(":not(.addCpyBtn)").attr("style"));
        
        if(elemStyle != undefined && (elemStyle.hasOwnProperty(prop) || ($(".style-container").find("p[name="+prop+"]").length == 1 && !elemStyle.hasOwnProperty(prop)))){
            $(".style-container").children('p[name='+prop+']').length > 1 ? $(".style-container").children('p[name='+prop+']').remove(":not(:first)") : null;
            var style = $(".style-container").children('p[name='+prop+']').text().split(":");
            style[1] = context[prop];
            tempObj[prop] = context[prop];
            $(".style-container").children('p[name='+prop+']').text(style.join(":"));
            applyStyles($(".element-container").children(":not(.addCpyBtn)")[0] ,tempObj , false);
        }
        else if($(".style-container").find("p[name="+prop+"]").length < 1){
            if(currentPathName.toString().replace("/" , "") == "designElement"){
                var p = document.createElement("p");
                p.setAttribute("contentEditable" , "true");
                p.setAttribute("name" , prop);
                p.innerText = prop + ": " + context[prop];
                $(".style-container").append(p);
            }
            tempObj[prop] = context[prop];
            applyStyles($(".element-container").children(":not(.addCpyBtn)")[0] ,tempObj , true);
        }
    }

    $(".style-container").on("keypress" , function(e){
        var keyCode = e.keyCode || e.which;
        if(e.target.nodeName == 'P'){
             if(e.keyCode == 13 && !e.shiftKey){
                e.preventDefault();
                var text = $(e.target).text().toString().split(":");
                text[1] ? text[1] = text[1].replace(/\s+/g, " ").trim() : text[1];

                var tempObj = {};
                tempObj[text[0]] = text[1];
                if((text.length <= 1 || text[0] == "" || text[1] == undefined || text[1] == "") || !defautlStyleObject.hasOwnProperty(text[0])){
                    $(e.target).remove();
                    refreshStyles();
                }
                else if($(e.target).attr("name") != text[0]){
                   $(e.target).attr("name" , text[0]);
                   refreshStyles(); 
                }
                else{
                    addStyle(/*$(".element-container").children()[0] ,*/tempObj/* , true*/);
                }

                // if($(e.target).attr("name") != text[0]){
                //     $(e.target).attr("name" , text[0]);
                //     refreshStyles();
                // }
                // else
                //    $(e.target).attr("name" , $(e.target).attr("name"));

                e.target.blur();
                return false;  
            }
        }
    });

    function refreshStyles(){
        $(".element-container").children(":not(.addCpyBtn)").removeAttr("style");
        var newStyleObj = {};
        var styleArray = Array.from($(".style-container p"));
        //$(".style-container").html("");
        $(".style-container").children(":not(.addCpyBtn)").remove();
        styleArray.forEach(function(node){
            var getStyleTxt = $(node).text().split(":");
            newStyleObj[getStyleTxt[0]] = getStyleTxt[1];
            addStyle(newStyleObj);
            newStyleObj = {};
        });
    }

    function applyStyles(target,styleObj , addNewStyle){
        var property = Object.keys(styleObj)[0];
        var tempStyleObj = {};
        if(addNewStyle != true){
            tempStyleObj = createStyleObject(target.getAttribute("style"))
            // target.getAttribute("style").split(";").map(function(x){
            //     var xKeyVal = x.split(":");
            //     xKeyVal[0] = xKeyVal[0].replace("\"" , "").trim();
            //     tempStyleObj.hasOwnProperty(xKeyVal[0]) == false && xKeyVal[0] != "" ?  tempStyleObj[xKeyVal[0]] = xKeyVal[1] : null;
            //     return true;
            // });
            delete tempStyleObj[property];
            tempStyleObj[property] = styleObj[property];
            $(target).removeAttr("style");
            Object.assign(target.style , tempStyleObj)
        }
        else
            target.style[property] = styleObj[property];
    }

    function applyAttributes(target , data) {
        for (var key in data){
            if(key == "style"){
               //Object.assign(createStyleObject(styleString) , target.style);
               continue;
            }
            target.removeAttribute(key)
            target.setAttribute(key , data[key]);
        }
    }

    function createStyleObject(styleString){
        var obj = {};
        if(styleString != undefined){
            Array.from(styleString.split(";")).map(function(x){
                x = x.split(":");
                (x[0] != "" && x[0] != undefined && x[0] != null) ? x[0] = x[0].replace(/\"/ , "").trim() : null;
                (x[1] != "" && x[1] != undefined && x[1] != null) ? x[1] = x[1].trim() : null;
                x.length == 2 ? obj[x[0]] = x[1] : null;
            });
        }
        return obj;
    }

    function copyElement(target , type){
        var elem = target.cloneNode(true);

        var classList = elem.classList;
        var classListLen = classList.length;
        var ID = "#id"+elem.id.toString();
        elem.removeAttribute("id");
        elem.setAttribute("id" , ID.replace(/#/,''));

        var inlineStyles = "";
        var ruleText = ID+"{"+elem.style.cssText+"}";

        var styleSheets = document.styleSheets;
        var createNewStyleSheet = document.createElement("style");
        createNewStyleSheet.setAttribute("id" , "newStyleSheet")
        var tempRuleText = "";
        var styleSheetRuleList = "";
        var ruleListLen = 0;
        var styleRule = "";
        document.querySelector("head").appendChild(createNewStyleSheet);
        var newStyleSheet = document.getElementById('newStyleSheet').sheet;
        var finalCSS = "";
        if(type == "E"){
            if(elem.hasAttribute("style")){
                newStyleSheet.insertRule(ruleText , 0);
                ruleListLen++;            
            }
            if(elem.hasAttribute("class")){
                styleSheetRuleList = styleSheets[0].cssRules || styleSheets[0].rules;
                for(var i=0;i<classListLen;i++){
                    styleRule = Array.from(styleSheetRuleList).filter(function (rule) {
                        if(rule.selectorText != undefined && rule.selectorText.includes(classList[i])){
                            return true;
                        }
                    });
                    if(styleRule.length > 0){
                       newStyleSheet.insertRule(styleRule[0].cssText , ruleListLen);
                       ruleListLen++; 
                    }
                }
            }
        }
        else if(type == "L"){

        }

        Array.from(newStyleSheet.rules).forEach(function(rule) {
            finalCSS+=rule.cssText+"\n";
        });
        var reader  = new FileReader();

        elem.removeAttribute("style");
        var buf = new Blob([getHTMLTemplate(elem.outerHTML , finalCSS).outerHTML] , {type : 'text/text'});
        // var url = URL.createObjectURL(buf);
        //window.open(url , '_blank' ).focus();

        reader.addEventListener("load", function () {
            var modal = document.createElement("div");
            modal.setAttribute("class" , "modal fade");
            modal.setAttribute("id" , "copyContent");
            modal.setAttribute("tabindex" , -1);

            var modalDialog = document.createElement("div");
            modalDialog.setAttribute("class" , "modal-dialog");

            var modalContent = document.createElement("div");
            modalContent.setAttribute("class" , "modal-content");

            var header = document.createElement("div");
            header.setAttribute("class" , "modal-header");
            header.setAttribute("style" , "border-bottom:0px solid black;");

            var closeBtn = document.createElement("button");
            closeBtn.setAttribute("class" , "close btn-danger");
            closeBtn.setAttribute("data-dismiss" , "modal");
            closeBtn.innerHTML = "&times;";

            var heading = document.createElement("h4");
            heading.setAttribute("class" , "modal-title");
            heading.innerHTML = "Copy Template";

            header.appendChild(closeBtn);
            header.appendChild(heading);

            var modalBody = document.createElement("div");
            modalBody.setAttribute("class" , "modal-body");

            var bodyContent = document.createElement("div");
            bodyContent.setAttribute("class" , "copiedContentFormWrapper");

            var copiedContentForm = document.createElement("div");
            copiedContentForm.setAttribute("class" , "form-horizontal");
            copiedContentForm.setAttribute("name" , "copiedContentForm");

            var fg = document.createElement("div");
            fg.setAttribute("class" , "form-group");

            var fgc = document.createElement("div");
            fgc.setAttribute("class" , "col-sm-12");
            var textarea = document.createElement("textarea");
            textarea.setAttribute("class" , "form-control");
            textarea.setAttribute("rows" , "15%");
            textarea.setAttribute("style" , "resize:none;height:auto;line-height:1.5;")
            textarea.innerText = reader.result;
            fgc.appendChild(textarea);
            fg.appendChild(fgc);
            copiedContentForm.appendChild(fg);
            bodyContent.appendChild(copiedContentForm);

            //Modal Footer starts
            var modalFooter = document.createElement("div");
            modalFooter.setAttribute("class" , "modal-footer");

            var copyToClipBoardBtn = document.createElement("button");
            copyToClipBoardBtn.setAttribute("class" , "btn btn-primary pull-left");
            copyToClipBoardBtn.innerHTML = "Copy To ClipBoard";
            copyToClipBoardBtn.addEventListener("click" , copyToClipBoard);

            var cancBtn = document.createElement("button");
            cancBtn.setAttribute("class" , "btn btn-primary");
            cancBtn.setAttribute("data-dismiss" , "modal");
            cancBtn.innerHTML = "Cancel";

            modalFooter.appendChild(copyToClipBoardBtn);
            modalFooter.appendChild(cancBtn);
            modalBody.appendChild(bodyContent);
            modalBody.appendChild(modalFooter);

            modalContent.appendChild(header);
            modalContent.appendChild(modalBody);
            modalDialog.appendChild(modalContent);
            modal.appendChild(modalDialog);
            $(".container").append(modal);
            $("#copyContent").modal('show');

            var code=$(textarea);
            var val=$.replace_tag(code.minify());
            var el=$("<div></div>").html(val);
            $.prettify_code(el);
            code.css('white-space', 'pre').show_code($.undo_tag(el.html()));

            $("#copyContent").on("hidden.bs.modal" , function(event){
                $(this).remove();
                newStyleSheet.disabled = true;
                newStyleSheet.ownerNode.parentElement.removeChild(newStyleSheet.ownerNode)
            });
        }, false);
        reader.readAsText(buf);
    }

    function getHTMLTemplate(htmlBody , cssContent) {
        var htmlTag = document.createElement("html");
        var headTag = document.createElement("head");
        var titleTag = document.createElement("title");
        var styleTag = document.createElement("style");
        var bodyTag = document.createElement("body");

        titleTag.innerHTML = "Test";

        styleTag.type = 'text/css';
        if(styleTag.styleSheet)
            styleTag.styleSheet.cssText = cssContent;
        else
            styleTag.appendChild(document.createTextNode(cssContent));

        headTag.appendChild(titleTag);
        headTag.appendChild(styleTag);
        bodyTag.innerHTML = htmlBody;
        htmlTag.appendChild(headTag);
        htmlTag.appendChild(bodyTag);
        
        return htmlTag;
    }

    $(".copyLayout").on("click" , function(){
        copyElement(getFinalLayout(generateLayout()) , "L");
        // generateLayout();
        // getFinalLayout(generateLayout());
    });

    $(".addProp").on("click" ,  function(){
        var modal = document.createElement("div");
        modal.setAttribute("class" , "modal fade");
        modal.setAttribute("id" , "styleModal");
        modal.setAttribute("tabindex" , -1);

        var modalDialog = document.createElement("div");
        modalDialog.setAttribute("class" , "modal-dialog");

        var modalContent = document.createElement("div");
        modalContent.setAttribute("class" , "modal-content");

        var header = document.createElement("div");
        header.setAttribute("class" , "modal-header");
        header.setAttribute("style" , "border-bottom:0px solid black;");

        var closeBtn = document.createElement("button");
        closeBtn.setAttribute("class" , "close");
        closeBtn.setAttribute("data-dismiss" , "modal");
        closeBtn.innerHTML = "&times;";

        var heading = document.createElement("h4");
        heading.setAttribute("class" , "modal-title");
        heading.innerHTML = "Add styles and Attributes";

        var help1 = document.createElement("p");
        help1.setAttribute("class" , "small text-info");
        help1.innerHTML = "*Note : Use + button to add style and - button remove style";

        var help2 = document.createElement("p");
        help2.setAttribute("class" , "small text-info");
        help2.innerHTML = "*Note : Make sure that you are entering all styles correctly else it will not be applied on the target";

        header.appendChild(heading);
        header.appendChild(closeBtn);
        header.appendChild(help1);
        header.appendChild(help2);

        // var help3 = document.createElement("p");
        // help3.setAttribute("class" , "pull-right help");
        // help3.setAttribute("data-toggle" , "popover");
        // help3.setAttribute("data-placement" , "bottom");

        // var hlp3Txt1 = document.createElement("span");
        // hlp3Txt1.setAttribute("class" , "text-primary");
        // hlp3Txt1.innerHTML = "Need Help ?? : ";

        // var hlp3Txt2 = document.createElement("span");
        // hlp3Txt2.setAttribute("class" , "btn btn-primary glyphicon glyphicon-question-sign");

        // help3.appendChild(hlp3Txt1);
        // help3.appendChild(hlp3Txt2);
        // header.appendChild(help3);

        var modalBody = document.createElement("div");
        modalBody.setAttribute("class" , "modal-body");

        var tabContainer = document.createElement("ul");
        tabContainer.setAttribute("class" , "nav nav-tabs tabContainer");

        var styleTab = document.createElement("li");
        styleTab.setAttribute("class" , "active");
        var styleFormLink = document.createElement("a");
        styleFormLink.setAttribute("data-toggle" , "tab");
        styleFormLink.setAttribute("data-target" , "#styleFormContainer");
        styleFormLink.innerText = "Apply Styles";
        styleTab.appendChild(styleFormLink);
        tabContainer.appendChild(styleTab);

        var attrTab = document.createElement("li");
        var attrTabLink = document.createElement("a");
        attrTabLink.setAttribute("data-toggle" , "tab");
        attrTabLink.setAttribute("data-target" , "#attrForm");
        attrTabLink.innerText = "Apply Attributes";
        attrTab.appendChild(attrTabLink);
        tabContainer.appendChild(attrTab);

        var tabContentHolder = document.createElement("div");
        tabContentHolder.setAttribute("class" , "tab-content");

        var styleFormContainer = document.createElement("div");
        styleFormContainer.setAttribute("class" , "tab-pane fade in active");
        styleFormContainer.setAttribute("id" , "styleFormContainer");

        var styleFormHelper = document.createElement("div");
        styleFormHelper.setAttribute("class" , "row col-sm-12");

        var help3 = document.createElement("p");
        help3.setAttribute("class" , "pull-right help");
        help3.setAttribute("id" , "styleHelp");
        help3.setAttribute("data-toggle" , "popover");
        help3.setAttribute("data-placement" , "bottom");

        var hlp3Txt1 = document.createElement("span");
        hlp3Txt1.setAttribute("class" , "text-primary");
        hlp3Txt1.innerHTML = "Need Help in applying styles?? : ";

        var hlp3Txt2 = document.createElement("span");
        hlp3Txt2.setAttribute("class" , "btn btn-primary glyphicon glyphicon-question-sign");

        help3.appendChild(hlp3Txt1);
        help3.appendChild(hlp3Txt2);
        styleFormHelper.appendChild(help3);
        styleFormContainer.appendChild(styleFormHelper);

        //Content for style form starts
        var styleFormWrapper = document.createElement("div");
        styleFormWrapper.setAttribute("class" , "styleFormWrapper");

        var styleForm = document.createElement("div");
        styleForm.setAttribute("class" , "form-horizontal");
        styleForm.setAttribute("name" , "styleForm");

        var fg = document.createElement("div");
        fg.setAttribute("class" , "form-group");

        var exText = document.createElement("label");
        exText.innerText = "==> Example";
        exText.setAttribute("class" , "col-sm-3 exTxt text-danger");

        var fgc = document.createElement("div");
        fgc.setAttribute("class" , "col-sm-6");
        var input = document.createElement("input");
        input.setAttribute("type" , "text");
        input.setAttribute("class" , "form-control");
        input.setAttribute("name" , "style1468569269359");
        input.value = "height:" + window.getComputedStyle($(".element-container").children(":not(.addCpyBtn , .tooltip)")[0]).height;
        fgc.appendChild(input);

        var addBtn = document.createElement("button");
        addBtn.setAttribute("class" , "col-sm-1 btn btn-primary addStyle");
        addBtn.setAttribute("title" , "Add new style");
        addBtn.setAttribute("data-toggle" , "tooltip");
        addBtn.setAttribute("data-trigger" , "hover");
        var addBtnC =  document.createElement("span");
        addBtnC.setAttribute("class" , "glyphicon glyphicon-plus");
        addBtn.appendChild(addBtnC);

        addBtn.addEventListener("click" , addListener);

        var removeBtn = document.createElement("button");
        removeBtn.setAttribute("class" , "col-sm-1 btn btn-primary removeStyle");
        removeBtn.setAttribute("title" , "Remove style");
        removeBtn.setAttribute("data-toggle" , "tooltip");
        removeBtn.setAttribute("data-trigger" , "hover");
        removeBtn.setAttribute("disabled" , true);
        var removeBtnC =  document.createElement("span");
        removeBtnC.setAttribute("class" , "glyphicon glyphicon-minus");
        removeBtn.appendChild(removeBtnC);

        removeBtn.addEventListener("click" , removeListener);

        function addListener(e){
            $(".help-block").remove();
            var target = e.target.closest(".form-group");
            var cloneNode = "";
            var closeParent = e.target.closest(".form-group");
            if(closeParent.getElementsByTagName("input")[0].value){
                cloneNode = e.target.closest(".form-group").cloneNode(true);
                cloneNode.querySelector(".exTxt") ? cloneNode.removeChild(cloneNode.querySelector(".exTxt")) : null;
                cloneNode.getElementsByTagName("input")[0].setAttribute("name" , "style"+(new Date()).getTime());
                cloneNode.getElementsByTagName("input")[0].value = "";
                e.target.closest(".form-group").insertAdjacentHTML('afterEnd' , cloneNode.outerHTML);
                $('#styleModal .tooltip').remove();
                $(e.target).closest(".form-group").closest(".form-horizontal").children(".form-group").children(".removeStyle").attr("disabled" , false);
                $(".addStyle").slice(0 , -1).remove();
                closeParent.nextSibling.getElementsByTagName("input")[0].addEventListener("input" , validateStyleModal);
                closeParent.nextSibling.getElementsByClassName("addStyle")[0].addEventListener("click" , addListener);
                closeParent.nextSibling.getElementsByClassName("removeStyle")[0].addEventListener("click" , removeListener);
                closeParent.nextSibling.scrollIntoView();
            }
            else{
                $(".help-block").remove();
                $("<span class='small help-block'>This Field Should not be empty</span>").insertAfter($(e.target).closest(".form-group").closest(".form-horizontal").children(".form-group").last().children(".col-sm-6").children("input"));
            }
            validateStyleModal(); 
        }

        function removeListener(e){
            var closeParent = e.target.closest(".form-group");
            var prevSibling = closeParent.previousSibling;
            if($(closeParent).closest(".form-horizontal").children(".form-group").length-1 == 1){
               $(closeParent).closest(".form-horizontal").children(".form-group").children(".removeStyle").attr("disabled" , true);
            }

            var addBtnCopy = closeParent.getElementsByClassName("addStyle")[0];
            if(addBtnCopy){
                prevSibling.appendChild(addBtnCopy.cloneNode(true));
                prevSibling.getElementsByClassName("addStyle")[0].addEventListener("click" , addListener);
            }
            $(closeParent).remove();
            validateStyleModal();
        }

        fg.appendChild(fgc);
        fg.appendChild(removeBtn);
        fg.appendChild(addBtn);
        fg.appendChild(exText);

        styleForm.appendChild(fg);
        styleFormWrapper.appendChild(styleForm);
        styleFormContainer.appendChild(styleFormWrapper);
        //Content for style form ends here

        //Attribute form starts
        var attrFormContainer = document.createElement("div");
        attrFormContainer.setAttribute("class" , "tab-pane fade");
        attrFormContainer.setAttribute("id" , "attrForm");

        var attrHelper = document.createElement("div");
        attrHelper.setAttribute("class" , "row col-sm-12");

        var attrFromWrapper = document.createElement("div");
        attrFromWrapper.setAttribute("class" , "attrFromWrapper");

        var attrForm = document.createElement("div");
        attrForm.setAttribute("class" , "form-horizontal");
        attrForm.setAttribute("name" , "attributeForm");

        var help4 = document.createElement("p");
        help4.setAttribute("class" , "col-sm-12 text-center");

        var hlp4Txt1 = document.createElement("span");
        hlp4Txt1.setAttribute("class" , "text-primary");
        hlp4Txt1.innerHTML = "Enter the values of attributes of interest ";

        help4.appendChild(hlp4Txt1);
        attrHelper.appendChild(help4);
        attrFromWrapper.appendChild(attrForm)
        attrFormContainer.appendChild(attrHelper);

        var selectedElement = $("#elements").val();
        var targetElement = $(".element-container").children(":not(.addCpyBtn , .tooltip)")[0];
        var attrList = targetElement.attributes;
        var attrLength = attrList.length;

        if(targetElement.hasAttributes()){
            hlp4Txt1.innerHTML = "Enter the values of attributes of interest ";
            var attrElement = "";
            var attrLabel = "";
    
            var afg = document.createElement("div");
            afg.setAttribute("class" , "form-group");

            var afgc = document.createElement("div");
            afgc.setAttribute("class" , "col-sm-10");

            var clonedAFG = "";
            var clonedAFGC = "";

            if (attrList.length > 0){
                for(var key=0;key<attrLength;key++){
                    if(attrList[key].name == "style")
                        continue;
                    attrLabel = document.createElement("label");
                    attrLabel.innerText = attrList[key].name.toUpperCase() + " : ";
                    attrLabel.setAttribute("class" , "control-label col-sm-2");
                    attrLabel.setAttribute("for" , selectedElement+"_"+attrList[key].name)
                    attrElement = document.createElement("input");
                    attrElement.type = "text";
                    attrElement.value = targetElement.hasAttribute(key) ? targetElement.getAttribute(key) : attrList[key].value;
                    attrElement.setAttribute("id" , selectedElement+"_"+attrList[key].name);
                    attrElement.setAttribute("name" , attrList[key].name);
                    attrElement.setAttribute("class" , "form-control");
                
                    clonedAFG = afg.cloneNode(true);
                    clonedAFGC = afgc.cloneNode(true);
                    clonedAFGC.appendChild(attrElement);
                    clonedAFG.appendChild(attrLabel);
                    clonedAFG.appendChild(clonedAFGC);
                    attrForm.appendChild(clonedAFG);
                }
            }
            else{
                hlp4Txt1.innerHTML = "We dont have any attributes to be applied on to this element";
            }                
        }
        else{
            hlp4Txt1.innerHTML = "We dont have any attributes to be applied on to this element";
        }

        attrFormContainer.appendChild(attrFromWrapper);
        //Attribute form ends here

        //Modal Footer starts
        var modalFooter = document.createElement("div");
        modalFooter.setAttribute("class" , "modal-footer");

        var cancBtn = document.createElement("button");
        cancBtn.setAttribute("class" , "btn btn-default");
        cancBtn.setAttribute("data-dismiss" , "modal");
        cancBtn.innerHTML = "Cancel";

        var subBtn = document.createElement("button");
        subBtn.setAttribute("class" , "btn btn-default");
        subBtn.setAttribute("id" , "finishAdding");
        subBtn.setAttribute("disabled" , true);
        subBtn.innerHTML = "Finish"
        modalFooter.appendChild(cancBtn);
        modalFooter.appendChild(subBtn);
        //Modal Footer ends

        tabContentHolder.appendChild(styleFormContainer);
        tabContentHolder.appendChild(attrFormContainer);
        tabContentHolder.appendChild(modalFooter);

        modalBody.appendChild(tabContainer);
        modalBody.appendChild(tabContentHolder);

        modalContent.appendChild(header);
        modalContent.appendChild(modalBody);
        modalDialog.appendChild(modalContent);
        modal.appendChild(modalDialog);
        $(".container").append(modal);
        $("#styleModal").modal('show');

        $("#styleModal .form-control").on("input" , function(e){
            validateStyleModal();
        });

        $("#finishAdding").on("click" , function(){
            var styleData = $('div[name=styleForm]').validate().toObj();
            var attrData = $('div[name=attributeForm]').validate().toObj();
            $("#styleModal").modal("hide");
            var newStyleObj = {};
            for(var key in styleData){
                newStyleObj[styleData[key].split(":")[0]] = styleData[key].split(":")[1];
                addStyle(newStyleObj);
                newStyleObj = {};
            }
            Object.getOwnPropertyNames(attrData).length === 0 ? null : applyAttributes($(".element-container").children(":not(.addCpyBtn , .tooltip)")[0] , attrData);
        });

        $("#styleModal").on("shown.bs.modal" , function(event){
            validateStyleModal();
        });
        
        $("#styleModal").on("hidden.bs.modal" , function(event){
            $(this).remove();
        });
       
        var selectedProps = [];

        $("#styleHelp").on("click" , function(){
            $(this).popover({
                html:true,
                trigger:"focus",
                placement:"bottom",
                container: '#styleModal',
                title:"<h4 class='bold'>Select the property of your choice<span class='close' id='closeHelpPopover'>&times;</span></h4>"+
                        "<div class='row'>"+
                        "<div class='col-sm-5'><label>Type to filter property</label></div>"+
                        "<div class='form-group'>"+                       
                        "<div class='col-sm-4'>"+
                        "<input type='search' name='filter' id='searchFilter' class='form-control' value='' />"+
                        "</div>"+
                        "</div>"+
                        "<div class='col-sm-1'>"+
                        "<span class='glyphicon glyphicon-filter btn btn-primary propHelp'><span class='hide'>Filter</span></span></span>"+
                        "</div>"+
                        "</div>",
                content: function(){
                    var div_id =  "popoverContent" + $.now();
                    return cssPropsPopoverContent(div_id);
                }
            }).popover('toggle');

            function cssPropsPopoverContent(div_id){
                $.ajax({
                    async : true,
                    url : "users/cssprops",
                    dataType : 'json',
                    cache: true,
                    success : function(d) {
                        var helpContent = "";
                        for(key in d){
                        helpContent +=  "<div class='row' data-filter="+key+">"+
                                        "<div class='col-sm-1'><label><input type='checkbox' name='helpCheck' value='' class='helpCheckbox'></label></div>"+
                                        "<div class='col-sm-4'><label>"+key+"</label></div>"+
                                        "<div class='form-group'>"+                       
                                        "<div class='col-sm-4'>"+
                                        "<input type='text' name="+'help'+Math.floor(Math.random()*(new Date()).getTime())+" class='form-control helpInput'>"+
                                        "</div>"+
                                        "</div>"+
                                        "<div class='col-sm-1'>"+
                                        "<span class='glyphicon glyphicon-question-sign btn btn-primary propHelp'><span class='hide'>"+d[key]+"</span></span></span>"+
                                        "</div>"+
                                        "</div>";
                        }
                        $("#"+div_id).html(helpContent);
                        attachSearchFilter();
                        attachCheckBoxCheckFun();
                        attachHelpInputFun();
                    }
                });
                var contentWrapper = document.createElement("div");
                contentWrapper.setAttribute("id" , div_id);
                var loadingImage = document.createElement("img");
                loadingImage.setAttribute("src" , "Images/loading.gif");
                loadingImage.setAttribute("alt" , "Loading...");
                contentWrapper.appendChild(loadingImage);
                return contentWrapper;
            }

            $('.popover').tooltip({
                selector: '.propHelp',
                placement:"bottom",
                container: '.popover',
                title:function(){
                    return $(this).children().text();
                }
            });

            $(".popover #closeHelpPopover").on("click" , function(){
                $("#styleHelp").popover("hide");
            });

            $(".modal").on("hidden.bs.popover" , function(e){
                e.stopImmediatePropagation();
                if(selectedProps.length > 0){
                    for(var i=0; i<selectedProps.length ; i++){
                        var tempObj = Object.keys(selectedProps[i]);
                        var lastField = $("#styleModal #styleFormContainer").find(".form-horizontal").children(".form-group").last().find("input");

                        if(lastField.val() != ""){
                            $("#styleModal #styleFormContainer").find(".form-horizontal").children(".form-group").last().find(".addStyle").click();
                            $("#styleModal #styleFormContainer").find(".form-horizontal").children(".form-group").last().find("input").val(tempObj[0]+":"+selectedProps[i][tempObj[0]]);  
                        }
                        else{
                            lastField.val(tempObj[0]+":"+selectedProps[i][tempObj[0]])  
                        }
                        
                        i < (selectedProps.length -1) ? $("#styleModal").find(".form-horizontal").children(".form-group").last().find(".addStyle").click() : null;  
                    }
                    validateStyleModal();
                    //$("#finishAdding").attr("disabled" , false);
                }
                selectedProps = [];
            });
        });

        function validateStyleModal(){
            // Array.from($("#styleModal .form-control")).every(function(node){
            //     return node.value ? true: false;    
            // }) ? $("#finishAdding").attr("disabled" , false) : $("#finishAdding").attr("disabled" , true);
            $("#styleModal #styleFormContainer .form-control").last().val() ? $("#finishAdding").attr("disabled" , false) : $("#finishAdding").attr("disabled" , true);
        }

        function attachSearchFilter(){
            var filter_div = $('[data-filter]');
            var val;
            $('.popover #searchFilter').keyup(function(event){
                if(event.which == 13){
                    $(this).blur();
                    return;
                }

                val = $.trim(this.value);
                filter_div.hide();

                if(val.length == 0) filter_div.show();

                filter_div.filter(function(){           
                    return $(this).data('filter').indexOf(val)>-1
                }).show();

            }).blur(function(){
                filter_div.filter(function(){            
                    return $(this).data('filter').indexOf(val)>-1
                }).show();
            });
        }

        function attachCheckBoxCheckFun(){
            $(".popover .helpCheckbox").on("change" , function(e){
                var styleObj = {};
                var indexToRemove = "";
                var label = $(e.target).parent().closest('.row').children(".col-sm-4").children("label").text();
                var value = $(e.target).parent().closest('.row').children(".form-group").children(".col-sm-4").children("input").val();
                value ? value = value : value = window.getComputedStyle($(".element-container").children(":not(.addCpyBtn)")[0])[label];
                $(e.target).parent().closest('.row').children(".form-group").children(".col-sm-4").children("input").val(value);
                if(!e.target.checked){
                    $(e.target).parent().closest('.row').children(".form-group").children(".col-sm-4").children("input").val("");
                }
                if(value){
                    styleObj[label] = value;
                    indexToRemove = selectedProps.findIndex(function(value , index){
                        return Object.keys(value)[0] == label ? true : false;
                    });
                    indexToRemove > -1 ? selectedProps.splice(indexToRemove , 1) : selectedProps.push(styleObj);
                }
            });
        }

        function attachHelpInputFun(){
            $(".popover .helpInput").on("input" , function(e){
                var styleObj = {};
                var indexToChange = "";
                var label = $(e.target).parent().closest('.row').children(".col-sm-4").children("label").text();
                var value = $(e.target).parent().closest('.row').children(".form-group").children(".col-sm-4").children("input").val();
                if($(e.target).parent().closest('.row').children(".col-sm-1:first-child").children("label").children(".helpCheckbox")[0].checked){
                    styleObj[label] = value;
                    indexToChange = selectedProps.findIndex(function(value , index){
                        return Object.keys(value)[0] == label ? true : false;
                    });
                    indexToChange > -1 ? selectedProps[indexToChange][label] = value : selectedProps.push(styleObj);
                }
            });
        }
    });
    
    function getChildObj(){
        var childObj = {};
        Array.from($(".droptarget").children()).forEach(function(node){
            var tempObj = node.getBoundingClientRect();
            childObj[node.id] = {};
            childObj[node.id].id = node.id;
            childObj[node.id].nodeName = node.nodeName;
            childObj[node.id].left = tempObj.left;
            childObj[node.id].right = tempObj.right;
            childObj[node.id].top = tempObj.top;
            childObj[node.id].bottom = tempObj.bottom;
            childObj[node.id].height = tempObj.height;
            childObj[node.id].width = tempObj.width;
            childObj[node.id].selected = false;
            childObj[node.id].float = "none";
        });
        return childObj;
    }

    function generateLayout(){
        var refWidth = document.querySelector('.droptarget').scrollWidth;
        var refLeft = document.querySelector('.droptarget').getBoundingClientRect().left;
        var refRight = document.querySelector('.droptarget').getBoundingClientRect().right;

        var intermediateLeft = 0;
        var intermediateTop = 0;
        var intermediateBottom = 0;

        var subElem = "";
        var subLeftRef = [];

        var interLeft = 0;
        var interRight = 0;
        var subTop = 0;
        var subBottom = 0;

        var refLayout = document.createElement("div");
        refLayout.setAttribute("class" , "wrapper");
        refLayout.setAttribute("style" , "width:100%;height:auto;float:left;");
        var elem = "";

        var layoutObj = getChildObj();
        var sortedLayoutObjArr = Object.keys(layoutObj).sort((a,b) => (layoutObj[a].left - layoutObj[b].left)).sort((a,b) => (layoutObj[a].top-5 - layoutObj[b].top));
        Object.keys(sortedLayoutObjArr).forEach(function(k){
            var value = sortedLayoutObjArr[k];
            var left = layoutObj[value].left;
            var right = layoutObj[value].right;
            var top = layoutObj[value].top;
            var bottom = layoutObj[value].bottom;
            var width = layoutObj[value].width;
            //This is condition is to get the 100% width elements
            if(layoutObj[value].selected != true && (left >= refLeft-25 && left <= refLeft+25) && (width >= refWidth-25 && width <= refWidth+25)){
                //elem = document.createElement(layoutObj[value].nodeName);
                elem = document.getElementById(value).cloneNode(true);
                $(elem).removeAttr("style");
                $(elem).removeAttr("id");
                elem.setAttribute("style" , "height:"+layoutObj[value].height+"px;width:100%;"+"float:left;outline:1px solid blue;");
                elem.setAttribute("id" , value);
                refLayout.appendChild(elem);
                layoutObj[value].selected = true;
            }
            //This condition is to get left aligned elements
            else if(layoutObj[value].selected != true && (left >= refLeft-25) && (left <= refLeft+25)){
                var filterLeftElems =  Object.keys(layoutObj).filter(function(val , ind){
                    subTop = layoutObj[val].top;
                    subBottom = layoutObj[val].bottom;
                    if(layoutObj[val].selected != true && (subTop >= top-10 && subTop <= top+10) && (subBottom >= bottom-10 && subBottom <= bottom+10)){
                        return true;
                    }
                });

                filterLeftElems.sort((a,b) => (layoutObj[a].left-layoutObj[b].left));
                interLeft = layoutObj[filterLeftElems[0]].left;

                filterLeftElems.forEach(function(filtVal , i){
                    //debugger
                    if(layoutObj[filtVal].selected != true && (layoutObj[filtVal].left >= interLeft-25 && layoutObj[filtVal].left <= interLeft+25)){
                        interLeft = layoutObj[filtVal].right;
                        layoutObj[filtVal].selected = true;
                        if(layoutObj[filterLeftElems[i-1]] && layoutObj[filterLeftElems[i-1]].float == "right")
                           layoutObj[filtVal].float = "right";
                        else
                            layoutObj[filtVal].float = "left"; 
                    }
                    else if(layoutObj[filtVal].selected != true && (layoutObj[filtVal].left >= interLeft+25 && layoutObj[filtVal].right <= refRight-100)){
                        if((filterLeftElems[i+1] && !(layoutObj[filtVal].right > layoutObj[filterLeftElems[i+1]].left-25)) || (!filterLeftElems[i+1] && layoutObj[filtVal].right <= refRight-100)){
                            layoutObj[filtVal].float = "left";
                            layoutObj[filtVal].position = "relative";
                        }
                        else{
                            layoutObj[filtVal].float = "right";
                        }
                        layoutObj[filtVal].leftPos = layoutObj[filtVal].left - interLeft;
                        layoutObj[filtVal].selected = true;
                        interLeft = layoutObj[filtVal].right;
                    }
                    else if(layoutObj[filtVal].selected != true && (layoutObj[filtVal].left >= interLeft+25 && layoutObj[filtVal].right >= refRight-100)){
                        layoutObj[filtVal].float = "right";
                        layoutObj[filtVal].selected = true;
                    }
                });
                //filterLeftElems.sort((a,b) => (layoutObj[b].right-layoutObj[a].right));
                refLayout.appendChild(generateSubLayout(filterLeftElems , layoutObj , refWidth)); 
            }

            //This condition is to get the right aligned elements
            else if(layoutObj[value].selected != true && (right >= refRight-25) && (right <= refRight+25)){
                var filterRightElems =  Object.keys(layoutObj).filter(function(val , ind){
                    subTop = layoutObj[val].top;
                    subBottom = layoutObj[val].bottom;
                    if(layoutObj[val].selected != true && (subTop >= top-10 && subTop <= top+10) && (subBottom >= bottom-10 && subBottom <= bottom+10)){
                        return true;
                    }
                });

                filterRightElems.sort(function(a,b){
                    return layoutObj[b].right-layoutObj[a].right;
                });
                interRight = layoutObj[filterRightElems[0]].right;
                filterRightElems.forEach(function(filtVal , i){
                    if(layoutObj[filtVal].selected != true && (layoutObj[filtVal].right >= interRight-25 && layoutObj[filtVal].right <= interRight+25)){
                        interRight = layoutObj[filtVal].left;
                        layoutObj[filtVal].float = "right";
                        layoutObj[filtVal].selected = true;
                    }
                    else if(layoutObj[filtVal].selected != true && (layoutObj[filtVal].right <= interRight-25 && layoutObj[filtVal].left >= refLeft+100)){
                        layoutObj[filtVal].float = "right";
                        layoutObj[filtVal].position = "relative";
                        layoutObj[filtVal].rightPos = interRight - layoutObj[filtVal].right;
                        layoutObj[filtVal].selected = true;
                        interRight = layoutObj[filtVal].left;
                    }
                    else if(layoutObj[filtVal].selected != true && (layoutObj[filtVal].right <= interRight-25 && layoutObj[filtVal].left <= refLeft+100)){
                        layoutObj[filtVal].float = "left";
                        layoutObj[filtVal].selected = true;
                    }
                });
                refLayout.appendChild(generateSubLayout(filterRightElems , layoutObj , refWidth)); 
            }
            //This condition is to get the centerly aligned elements
            else if(layoutObj[value].selected != true && (left >= refLeft+25 && right <= refRight-25)){
                subTop = layoutObj[value].top;
                subBottom = layoutObj[value].bottom;
                var filterMiddle = Object.keys(layoutObj).filter(x=>layoutObj[x].selected != true).filter(function(v,i){
                    return (layoutObj[v].top >= subTop-5 && layoutObj[v].top <= subTop+5) && (layoutObj[v].bottom >= subBottom-5 && layoutObj[v].bottom <= subBottom+5);
                }).sort((a,b) => (layoutObj[a].left-layoutObj[b].left));

                var checkMiddlePos = filterMiddle.every(x => (layoutObj[x].left >= refLeft+25 && layoutObj[x].right <= refRight-25));
                if(checkMiddlePos == true){
                    filterMiddle.forEach(function(v){
                        layoutObj[v].float = "center";
                        layoutObj[v].selected = true;
                    });
                    refLayout.appendChild(generateSubLayout(filterMiddle , layoutObj , refWidth));
                }
            }
        });
        return {
            layout:refLayout,
            layoutObj:layoutObj
        }
    }

    function generateSubLayout (arr , layoutObj , refWidth){
        var parentElem = document.createElement("div");
        parentElem.setAttribute("style", "height:auto;width:100%;float:left;");
        var childElem;
        var childHeight;
        var childWidth;

        for(var i=0;i<arr.length;i++){
            childElem = document.getElementById(arr[i]).cloneNode(true);
            $(childElem).removeAttr("style");
            $(childElem).removeAttr("id");
            //childElem = document.createElement(layoutObj[arr[i]].nodeName);
            childHeight = layoutObj[arr[i]].height;
            childWidth = layoutObj[arr[i]].width/refWidth*100+"%";
            childElem.setAttribute("style" , "height:"+childHeight+"px;width:"+childWidth+";outline:1px solid blue;");
            childElem.setAttribute("id",arr[i]);
            if((layoutObj[arr[i]].float == "none" || layoutObj[arr[i]].float == "left" || layoutObj[arr[i]].float == "right") && layoutObj[arr[i]].position == "relative"){
                layoutObj[arr[i]].float != "none" ? childElem.style.float = layoutObj[arr[i]].float :"";
                childElem.style.position = "relative";
                childElem.style.left = layoutObj[arr[i]].leftPos +"px";
                childElem.style.right = layoutObj[arr[i]].rightPos +"px";
            }
            else if(layoutObj[arr[i]].float == "left" || layoutObj[arr[i]].float == "right"){
                layoutObj[arr[i]].float != "none" ? childElem.style.float = layoutObj[arr[i]].float :"";
            }
            else if(layoutObj[arr[i]].float == "center"){
               parentElem.style.textAlign = "center";
               childElem.style.display = "inline-block";
            }
            parentElem.appendChild(childElem);
        }
        return parentElem;
    }

    function getFinalLayout(layout){
        var domLayout = layout.layout;
        var layoutObj = layout.layoutObj;
        var parentElemArray = [];
        var childElem = "";
        var parentNodeId = "";
        var prevSibId = "";
        var nextSibId = "";
        var childElemClone = "";
        var len = 0;
        var layoutArray = [];
        layoutArray = Object.keys(layoutObj).sort((a,b) => layoutObj[a].left-layoutObj[b].left).sort((a,b) => layoutObj[a].top-layoutObj[b].top-5);
        layoutArray.forEach(function(value){
            parentElemArray = Object.keys(layoutObj).filter(x => (value != x && layoutObj[x].left<=layoutObj[value].left && layoutObj[x].right>=layoutObj[value].right && layoutObj[x].top<=layoutObj[value].top && layoutObj[x].bottom>=layoutObj[value].bottom ));
            len = parentElemArray.length;
            childElem = $(domLayout).find("#"+value)[0];
            if(childElem == undefined)
                return true;

            if(len != 0){
                childElem.parentNode.childNodes.length > 1 ? childElem = childElem.parentNode : childElem = childElem;
                childElemClone = $(childElem).clone(true);
                childElem.parentNode.childNodes.length > 1 ? $(childElemClone).css("text-align" , "inherit") : "";
                $(childElem).remove();
            }

            if(len == 1){
               $(domLayout).find("#"+parentElemArray[0]).append(childElemClone);
            }
            else if(len > 1){
                $(domLayout).find("#"+parentElemArray[len-1]).append(childElemClone);
            }

            childElem = $(domLayout).find("#"+value)[0];
            parentNodeId = childElem.parentNode.id;
            if(!parentNodeId && childElem.parentNode.parentNode){
                parentNodeId = childElem.parentNode.parentNode.id;  
            }
            if(parentNodeId){
                childElem.style.width = layoutObj[value].width/layoutObj[parentNodeId].width*100+"%";
                childElem.style.boxSizing = "border-box";
                childElem.style.margin = "0px";
                childElem.style.padding = "0px";
                layoutObj[value].float == "center" ? childElem.style.float = "left" : childElem.style.float = layoutObj[value].float;
            }
        });
        
        $(domLayout).children(":empty").remove();
        return domLayout;
    }

    function copyToClipBoard(){
        $("#copyContent").find("textarea").select()
        document.execCommand('copy');
    }
});