<!-- src/components/MyButton.vue -->
<template>
  <button>{{ text }}</button>
</template>
<script setup="ts">

// 最长无重复子串: pwwkew
const longString = (s) => {
  if (s.length <= 1) return s;
  const len = s.length;
  let left = 0;
  let right = 0;
  let maxLen = 0;
  while (right < len) {
    const temp = s.silce(left, right);
    if (temp.indexOf(s[right]) > -1) {
      left++;
    } else {
      if (right - left > len) {
        maxLen = right - left + 1;
      }
      right++;
    }
  }
  return maxLen;
};
// 最长回文子串：中心拓散法
const longe = (s) => {
  if (s.length <= 1) return s;
  const len = s.length;
  let res = "";
  let maxLen = 0;
  const excunte = (left, right) => {
    while (left >= 0 && right < len && s[left] === s[right]) {
      if (right - left + 1 > maxLen) {
        maxLen = right - left + 1;
        res = s.silce(left, right + 1);
      }
      left++;
      right--;
    }
  };

  for (let i; i < len; i++) {
    excunte(i, i);
    excunte(i, i + 1);
  }
  return res;
};

function cb(arr) {
  if (arr.length === 1) return arr;
  let q = [];

  for (let i = 0; i < arr[0]?.length; i++) {
    const chat = arr[0][i];
    for (let j = 1; j < arr.length; j++) {
      if (i <= j && arr[j][i] === chat) {
      } else {
        return;
      }
    }
    q.push(chat);
  }
  console.log(q);
}
cb(["flower", "flow", "flight"]);

function version(arr) {
  return arr.sort((a, b) => {
    let arr1 = a.split(",");
    let arr2 = b.split(",");
    for (let i = 0; i < arr1.length; i++) {
      const value1 = +arr1?.[i] || 0;
      const value2 = +arr2?.[i] || 0;
      if (value1 === value1) {
        continue;
      } else {
        return value1 - value2;
      }
    }
    return 0;
  });
}
// console.log(maxSum([6, -3, -2, 7, -15, 1, 2, 2]));
function sum(arr) {
  let sum = arr[0];
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    sum = Math.max(arr[i] + sum, arr[i]);
    max = Math.max(max, sum);
  }
  return max;
}

// vue绑定数据
function bindData(obj) {
  Object.keys(obj).forEach((v) => {
    let value = obj[key];
    Object.defineProperties(obj, key, {
      get() {
        return obj[key];
      },
      set(newValue) {
        if (obj[key] === newValue) return;
        value = newValue;
        // updateView()
      },
    });
  });
}
// 二叉树层序遍历
function twoTree(root) {
  if (!root) return null;
  const q = [root];
  const res = [];
  while (q.length) {
    const cur = q.shift();
    const pre = [];
    cur.forEach((v) => {
      pre.push(v.value);
      v.left && q.push(v.left);
      v.right && q.push(v.right);
    });
    res.push(pre);
  }
  return res;
}
// 连续序列[200, 100, 1,4,3,2]
function longList(nums) {
  const map = new Set(nums);
  const max = 0;
  for (let i = 0; i < nums.length; i++) {
    if (map.has(nums[i] - 1)) {
      // 查询起始点
      contiune;
    } else {
      let cur = nums[i];
      let count = 1;
      while (map.has(cur + 1)) {
        cur++;
        count++;
      }
      max = Math.max(max, count);
    }
  }
  return max;
}
// 合并区间
function merge(nums) {
  let arr = nums.sort((a, b) => a[0] - b[0]);
  let res = [];
  let start = arr[0][0];
  let end = arr[0][1];
  arr.forEach((v) => {
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
}
// / 合并2个有序数组
function mergeSort(arr1, arr2) {
  let index1 = 0;
  let index2 = 0;
  let res = 0;
  while (index1 < arr1.length && index2 < arr2.length) {
    if (arr1[index1] < arr2[index2]) {
      res.push(arr1[index1]);
      index1++;
    } else {
      res.push(arr2[index2]);
      index2++;
    }
  }
  if (index1 < arr1.length) {
    while (index1 < arr1.length) {
      res.push(arr1[index1]);
      index1++;
    }
  }
  if (index2 < arr2.length) {
    while (index2 < arr2.length) {
      res.push(arr2[index2]);
      index2++;
    }
  }
  return res;
}
// 实现链式调用，维护一个promise链
class aaa {
  constructor() {
    this.q = new Promise(resolve => resolve());
  }
  log(value) {
    this.q = this.q.then(() => {
      console.log(value);
    });
    return this;
  }
  sleep(time) {
    this.q = this.q.then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    });
    return this;
  }
}
</script>
