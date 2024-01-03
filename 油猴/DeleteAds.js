

let clearElementList = [
    
];


// 创建一个 style 元素
// var styleElement = document.createElement("style");

// 添加样式规则
// styleElement.textContent = "body { background-color: lightblue; }";

// 将 style 元素添加到文档的 head 中
// document.head.appendChild(styleElement);

console.log("开始清理"+clearElementList);
window.Do_it = function(clearElementList) {

    // 创建一个style标签
    let style = createElement("style");
    clearElementList.forEach((item) => {
        style.innerText += `${item}{display:none !important}"`
    });
    document.head.appendChild(style);
}
Do_it(clearElementList);
console.log("Done;");


const clearElement = (clearElementList) =>{
    let style = createElement("style");
    clearElementList.forEach((item) => {
        style.innerText += `${item}{display:none !important}"`
    });
    document.head.appendChild(style);
}

addEventListener("load",()=>{
    console.log("开始清理"+clearElementList);
    clearElement(clearElementList);
    console.log("Done;");
})




const x = typeof(clearElement)==="object";
x // 一直都是true