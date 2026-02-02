<script setup>
// 合并2个有序数组
function mergeArrays(arr1, arr2) {
  let mergedArray = [];
  let index1 = 0;
  let index2 = 0;

  while (index1 < arr1.length && index2 < arr2.length) {
    if (arr1[index1] < arr2[index2]) {
      mergedArray.push(arr1[index1]);
      index1++;
    } else {
      mergedArray.push(arr2[index2]);
      index2++;
    }
  }

  // 将剩余的元素追加到合并数组中
  while (index1 < arr1.length) {
    mergedArray.push(arr1[index1]);
    index1++;
  }

  while (index2 < arr2.length) {
    mergedArray.push(arr2[index2]);
    index2++;
  }

  return mergedArray;
}

const arr1 = [1, 3, 5, 7];
const arr2 = [2, 4, 6, 8];
console.log(mergeArrays(arr1, arr2)); // 输出 [1, 2, 3, 4, 5, 6, 7, 8]

// 合并区间：双指针，核心是判断一个闭区间已出现后，移动end指针
// 若当前数组第0项大于当前的end，则证明一个闭区间已出现，此时push到res中
// 若当前数组第0项小于等于当前的end，且第1项大于当前的end，说明需要扩大区间，此时应更新end
// 遍历完毕后，更新最后的start和end到res中
var mergeRange = (intervals) => {
  intervals.sort((a, b) => a[0] - b[0]);
  let res = [];
  let start = intervals[0][0];
  let end = intervals[0][1];
  intervals.forEach((v) => {
    if (v[0] > end) {
      res.push([start, end]);
      start = v[0];
      end = v[1];
    } else {
      end = v[1];
    }
  });
  res.push([start, end]);
  return res;
};
console.log(
  mergeRange([
    [4, 5],
    [2, 4],
    [4, 6],
    [3, 4],
    [0, 0],
    [1, 1],
    [3, 5],
    [2, 2],
  ])
);
// console.log(
//   mergeRange([
//     [1, 4],
//     [5, 6],
//   ])
// );
// console.log(
//   mergeRange([
//     [1, 3],
//     [2, 6],
//     [8, 10],
//     [15, 18],
//   ])
// );
// 最长公共子串：dp二维数组
var longestCommonSubsequence = function (text1, text2) {
  let len1 = text1?.length;
  let len2 = text2?.length;
  let dp = new Array(len1 + 1).fill(0).map((i) => new Array(len2 + 1).fill(0));

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      let s1 = text1[i - 1];
      let s2 = text2[j - 1];
      if (s1 === s2) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], d[i][j - 1]);
      }
    }
  }
  return dp[len1][len2];
};
// 连续最大和
const maxSum = (arr) => {
  if (arr?.length <= 1) return arr[0];
  let max = 0;
  let res = 0;
  for (let i = 1; i < arr.length; i++) {
    max = Math.max(arr[i], max + arr[i]);
    res = Math.max(res, max);
  }
  return res;
};
console.log(maxSum([6, -3, -2, 7, -15, 1, 2, 2]));
// debounce 节流
const debounce = (fn, delay) => {
  let time = null;
  return function () {
    clearTimeout(time);
    let that = this;
    let args = arguments;
    time = setTimeout(() => {
      fn.apply(that, args);
    }, delay);
  };
};
// 最长公共子串

// 最长无重复子串: pwwkew
const longString = (s) => {
  if (s.length <= 1) return s;
  const len = s.length;
  let left = 0;
  let right = 0;
  let maxLen = 0;
  while (right < len) {
    const temp = s?.slice(left, right);
    if (temp.indexOf(s[right]) > -1) {
      left++;
    } else {
      maxLen = Math.max(right - left + 1, maxLen);
      right++;
    }
  }
  return maxLen;
};
console.log(longString("pwwkew"));
console.log(longString("abcabcbb"));
console.log(longString("bbbb"));
// 最长回文子串：中心拓散法
const longSub = (s) => {
  if (s.length <= 1) return s;
  const len = s.length;
  let maxLen = 0;
  let res = "";
  const excunte = (left, right) => {
    while (left >= 0 && right < len && s[left] === s[right]) {
      if (right - left + 1 > maxLen) {
        maxLen = right - left + 1;
        res = s.slice(left, right + 1);
      }
      left--;
      right++;
    }
  };
  for (let i = 0; i < len; i++) {
    if (len % 2 === 0) {
      excunte(i, i + i);
    } else {
      excunte(i, i);
    }
  }
  return {
    res,
    maxLen,
  };
};
console.log(longSub("babad"));
console.log(longSub("cbbd"));

setTimeout(() => {
  console.log(1);
}, 0);
Promise.resolve().then(() => {
  console.log(2);
});
Promise.resolve().then(() => {
  console.log(4);
});
console.log(3);
// 版本号排序大小
function compareVersions(versions) {
  return versions.sort((a, b) => {
    const tempA = a.split(".");
    const tempB = b.split(".");
    // 可能存在1.111.1长版本号，需要获取最大长度，不足的补0
    const maxLen = Math.max(tempA.length, tempB.length);
    for (let i = 0; i < maxLen; i++) {
      const valueA = +tempA[i] || 0;
      const valueB = +tempB[i] || 0;
      // 相等什么都不做，循环下一次
      if (valueA === valueB) {
        continue;
      }
      return valueA - valueB;
    }
    return 0;
  });
}
// 数字千分位
function trans(num) {
  const str = num.toString().split("").reverse();
  const res = [];
  for (let i = 0; i < string.length; i++) {
    if (i && i % 3 === 0) {
      res.push(",");
    }
    res.push(str[i]);
  }
  return res;
}
// 实现一个拼手气抢红包算法,输入金额和个数
class RedPackage {
  constructor(money, count) {
    this.money = money;
    this.count = count;
    this._remain = money - this.count * 0.01;
    this.minMoney = this.count * 0.01;
  }
  open() {
    if (this.count <= 0) {
      console.log("红包抢完了");
      return;
    }

    if (this.count === 1) {
      this.count--;
      console.log("红包", (this._remain + this.minMoney).toFixed(2));
      return;
    }
    const red = Math.random() * this._remain;
    this.count--;
    this._remain = this._remain - red;
    // 如果剩余钱等于最小钱数，输出最小值0.01
    if (this._remain === this.minMoney - 0.01) {
      this.minMoney = this.minMoney - 0.01;
      console.log("红包", 0.01);
    } else {
      console.log("红包", red.toFixed(2));
    }
  }
}
const openRed = new RedPackage(100, 5);
console.log("*****", openRed.open());
console.log("*****", openRed.open());
console.log("*****", openRed.open());
console.log("*****", openRed.open());
console.log("*****", openRed.open());
console.log("*****", openRed.open());
// 公共前缀,数组中最短字符串的长度，然后逐个字符比较所有字符串在该位置上的字符是否相同。
// 取巧方法，先sort然后第一个和最后一个比较
longestCommonPrefix(["flower", "flow", "flight"]);
function longestCommonPrefix(strs) {
  if (strs.length === 0) return "";
  let prefix = "";

  for (let i = 0; i < strs[0].length; i++) {
    const char = strs[0][i];
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j]?.length || strs[j][i] !== char) {
        console.log(11, prefix);
        return prefix;
      }
    }
    prefix += char;
  }
  console.log(prefix);
  return prefix;
}

function transStr(str) {
  let res = "";

  function loop(str) {
    if (str.indexOf("[") === -1) {
      return "";
    }
    let repeatNum = 0;
    for (let i = 0; i < str?.length; i++) {
      if (Number(str[i])) {
        repeatNum = str[i];
      } else if (str[i] === "[") {
        const right = str.lastIndexOf("]");
        const currentStr = str.slice(i + 1, right);
        if (repeatNum === 0) {
          repeatNum = 1;
        }
        const str1 = currentStr.repeat(repeatNum);
        res += str1;
        res.replace("[", "");
        res = res.slice(0, right) + "";
        console.log(res);
        // res += loop(str1);
      } else {
        if (str[i] !== "[" && str[i] !== "]") {
          res += str[i];
        }
      }
    }
  }
  loop(str);
  console.log(res);
}

// transStr("j3[a2]");
transStr("3[a2[c]]");

// 大数相加
let a = "9007199254740991";
let b = "1234567899999999999";
function add(a, b) {
  //取两个数字的最大长度
  let maxLength = Math.max(a.length, b.length);
  //用0去补齐长度
  a = a.padStart(maxLength, 0); //"0009007199254740991"
  b = b.padStart(maxLength, 0); //"1234567899999999999"
  //定义加法过程中需要用到的变量
  let cur = 0;
  let f = 0; //"进位"
  let sum = "";
  for (let i = maxLength - 1; i >= 0; i--) {
    cur = parseInt(a[i]) + parseInt(b[i]) + f;
    f = Math.floor(cur / 10);
    sum = (cur % 10) + sum;
  }
  if (f == 1) {
    sum = "1" + sum;
  }
  return sum;
}
// 最大并发请求
async function(urls, max){
  return new Promise((resolve,reject) => {
    let num = 0
    let task = urls
    let res = []
    function next(){
      if(task.length === 0) {
        resolve(res)
        return
      }
       let url = task.shift(); 
       num++
       await url()
       next()

    }
    next()
  })
}
</script>

<template>
  <div class="card">
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
