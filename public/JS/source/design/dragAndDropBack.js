function dragStart(event){
	event.dataTransfer.setData("text/plain" , event.target.id);
	event.dataTransfer.effectAllowed = "copy";
}

function allowDrop(event){
	event.preventDefault();	
	event.dataTransfer.effectAllowed = "copy";
}

function dragEnter(event) {
	document.querySelector(".droptarget").scrollIntoView();
    if ( event.target.className.split(" ")[1] == "droptarget" ) {
        $(".droptarget").css("border" , "3px dotted red");
    }
}

function dragLeave(event) {
    if ( event.target.className.split(" ")[1] == "droptarget" ) {
        event.target.style.border = "";
    }
}

function drop(event){
	event.preventDefault();
	var draggedElement = document.getElementById(event.dataTransfer.getData("text/plain"));
	$(draggedElement).removeAttr("draggable");

	if($(event.target).hasClass("droptarget"))
		$(event.target).append(draggedElement);
	else
		$(".droptarget").append(draggedElement);
	var cloneDraggedNode = draggedElement.cloneNode(true);
	cloneDraggedNode.setAttribute("draggable" , true);
	cloneDraggedNode.setAttribute("id" , (new Date()).getTime());
	cloneDraggedNode.addEventListener("dragstart" , function(event){
        dragStart(event);
    });
	$(".element-container").append(cloneDraggedNode);

	$(".droptarget").css("border" , "0px dotted red");
	dragDrop.initElement(draggedElement);
}

var elemPosObj = {};

var dragDrop = {
	initialMouseX: undefined,
	initialMouseY: undefined,
	startX: undefined,
	startY: undefined,
	draggedObject: undefined,
	initElement: function (element) {
		element = document.getElementById(element.id);
		element.onmousedown = dragDrop.startDragMouse;
		var parentPos = element.parentNode.getBoundingClientRect();
		var elemPos = element.getBoundingClientRect();
		var left = (elemPos.left - parentPos.left)+'px';
		var top =  (elemPos.top - parentPos.top)+'px';
		var propName = "id"+element.id;
		if(elemPosObj.hasOwnProperty(propName)){
			elemPosObj["id"+element.id].left = left;
			elemPosObj["id"+element.id].top = top;
		}
		else{
			Object.defineProperty(elemPosObj , propName , {
				value:{
					left:left,
					top:top
				},
				writable:true,
				enumerable:true,
				configurable:true
			});
		}
		$(element).trigger("mousedown");
		$(element).trigger("mouseup");
	},
	startDragMouse: function (e) {
		this.style.position = "absolute";
		this.style.left = elemPosObj["id"+this.id].left;
		this.style.top = elemPosObj["id"+this.id].top;
		dragDrop.startDrag(this);
		var evt = e || window.event;
		evt.clientX == undefined ? dragDrop.initialMouseX = this.getBoundingClientRect().width/2 + this.getBoundingClientRect().left : dragDrop.initialMouseX = evt.clientX;
		evt.clientY == undefined ? dragDrop.initialMouseY = this.getBoundingClientRect().height/2 + this.getBoundingClientRect().top : dragDrop.initialMouseY = evt.clientY;
		addEventSimple(document,'mousemove',dragDrop.dragMouse);
		addEventSimple(document,'mouseup',dragDrop.releaseElement);
		return false;
	},
	startDrag: function (obj) {
		//debugger
		if (dragDrop.draggedObject)
			dragDrop.releaseElement();
		dragDrop.startX = obj.offsetLeft;
		dragDrop.startY = obj.offsetTop;
		dragDrop.draggedObject = obj;
		obj.className += ' dragged';
	},
	dragMouse: function (e) {
		var evt = e || window.event;
		var dX = evt.clientX - dragDrop.initialMouseX;
		var dY = evt.clientY - dragDrop.initialMouseY;
		dragDrop.setPosition(dX,dY);
		return false;
	},
	setPosition: function (dx,dy) {
		(dragDrop.startX + dx < 0) ? dragDrop.draggedObject.style.left = 0+'px' : dragDrop.draggedObject.style.left = dragDrop.startX + dx + 'px';
		(dragDrop.startY + dy < 0) ? dragDrop.draggedObject.style.top = 0+'px' : dragDrop.draggedObject.style.top = dragDrop.startY + dy + 'px';
		(dragDrop.startX + dx < 0) ? elemPosObj["id"+dragDrop.draggedObject.id].left = 0+'px': elemPosObj["id"+dragDrop.draggedObject.id].left = dragDrop.startX + dx + 'px';
		(dragDrop.startY + dy < 0) ? elemPosObj["id"+dragDrop.draggedObject.id].top = 0+'px' : elemPosObj["id"+dragDrop.draggedObject.id].top = dragDrop.startY + dy + 'px';
	},
	releaseElement: function() {
		removeEventSimple(document,'mousemove',dragDrop.dragMouse);
		removeEventSimple(document,'mouseup',dragDrop.releaseElement);
		dragDrop.draggedObject.className = dragDrop.draggedObject.className.replace(/dragged/,'');
		dragDrop.draggedObject = null;
	}
}
function addEventSimple(obj,evt,fn) {
	if (obj.addEventListener)
		obj.addEventListener(evt,fn,false);
	else if (obj.attachEvent)
		obj.attachEvent('on'+evt,fn);
}

function removeEventSimple(obj,evt,fn) {
	if (obj.removeEventListener)
		obj.removeEventListener(evt,fn,false);
	else if (obj.detachEvent)
		obj.detachEvent('on'+evt,fn);
}