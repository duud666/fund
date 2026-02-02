import MyButton from './MyButton.vue';
export { MyButton }; // 导出所有组件，以便在外部使用。
function debounce (fn, delay){
    let time = null
    return function () {
        clearTimeout(time)
        let that = this
        let args = arguments
        time = setTimeout(()=>{
            fn.apply(that, args)
        },delay)
    }
}