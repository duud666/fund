<!-- src/App.vue -->
<template>
  <div class="container" :class="{ 'dark-theme': isDarkTheme }">

    <!-- 功能区域 -->
    <div class="function-area">
      <!-- 添加基金区域 -->
      <div class="add-fund-form">
        <div class="field-with-theme-toggle">
          <van-field
            v-model="inputCodeStr"
            label="基金代码"
            placeholder="如 001234"
            style="flex: 1;"
          />
          <!-- <div class="theme-toggle">
            <van-switch
              v-model="isDarkTheme"
              active-text="暗黑"
              inactive-text="浅色"
              @change="toggleTheme"
              style="margin-left: 12px"
            />
          </div> -->
        </div>
        <div class="button-group">
          <van-button type="primary" @click="addFund" style="margin-right: 8px;">
            添加
          </van-button>
          <van-button type="primary" @click="refreshAllFunds" style="margin-right: 8px;">
            手动刷新
          </van-button>
          <van-uploader
            :max-count="1"
            :auto-upload="false"
            :before-read="handleImageUpload"
            accept="image/*"
            style="margin-right: 8px;"
          >
            <van-button type="success">图片识别</van-button>
          </van-uploader>
          <van-button type="success" @click="clearCache">重置</van-button>
        </div>
      </div>

      <!-- 图片识别区域 -->
      <div class="image-recognition-area">
        <div v-if="imageUrl" style="margin-top: 10px">
          <img :src="imageUrl" class="image-preview" />
        </div>
        <div v-if="recognizing" style="margin-top: 10px; color: #409eff">
          正在识别图片，请稍候...
        </div>
        <div v-if="recognitionResult" style="margin-top: 10px">
          <div v-if="recognizedCodes.length > 0">
            <h4>提取的基金代码：</h4>
            <div class="tag-group">
              <van-tag v-for="code in recognizedCodes" :key="code" style="margin: 5px;">
                {{ code }}
              </van-tag>
            </div>
            <van-button type="primary" @click="addRecognizedFunds" style="margin-top: 10px;">
              添加识别的基金
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 基金列表 -->
    <div class="fund-list">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        style="max-height: calc(100vh - 200px); overflow-y: auto;"
      >
        <van-cell-group v-for="fund in fundList" :key="fund.code">
          <van-cell
            :title="fund.name"
          >
            <template #label>
              <div class="cell-label">
                <span>{{ fund.code }}</span>
                <br>
                <span class="update-time-text">更新时间: {{ formatUpdateTime(fund.update_time) || '--' }}</span>
              </div>
            </template>
            <template #default>
              <div class="fund-details">
                <div class="fund-net-value">
                  估算净值: {{ fund.estimate_net ? fund.estimate_net.toFixed(4) : '--' }}
                </div>
                <div class="fund-change">
                  涨幅: 
                  <span
                    :style="{ color: fund.change_pct > 0 ? '#f56c6c' : '#67c23a', fontWeight: 800 }"
                  >
                    {{ fund.change_pct
                        ? (fund.change_pct >= 0 ? "+" : "") + fund.change_pct.toFixed(2) + "%"
                        : "--"
                      }}
                  </span>
                </div>
              </div>
            </template>
            <template #right>
              <van-button
                type="danger"
                size="small"
                @click="removeFund(fund.code)"
              >
                删除
              </van-button>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { recognize } from "tesseract.js";
import { showToast } from "vant";
const savedCodes = JSON.parse(localStorage.getItem("currentCode") || "[]");
const code = ["025857", "001770", "016708", "002610"];
const inputCodeStr = ref(""); // 用户输入的基金代码字符串
const fundList = ref([]);
const loading = ref(false);
const timer = ref(null);
const defaultCodes = ref(savedCodes.length > 0 ? savedCodes : code);
const finished = ref(false); // 用于van-list的加载状态
// 从 localStorage 读取 currentCode，默认为空数组
console.log("savedCodes:", savedCodes, typeof savedCodes);

// 图片识别相关
const imageUrl = ref("");
const recognizing = ref(false);
const recognitionResult = ref("");
const recognizedCodes = ref([]);

// 主题相关
const isDarkTheme = ref(true); // 默认暗黑主题
// 获取单只基金估值
async function fetchFundEstimate(code) {
  try {
    // 使用 JSONP 绕过 CORS（天天基金只支持 JSONP）
    return new Promise((resolve, reject) => {
      const scriptId = `jsonp_${code}`;
      // 清除旧脚本
      const oldScript = document.getElementById(scriptId);
      if (oldScript) oldScript.remove();

      const script = document.createElement("script");
      script.id = scriptId;
      window.jsonpgz = (data) => {
        resolve({
          code: data.fundcode,
          name: data.name,
          estimate_net: parseFloat(data.gsz),
          change_pct: parseFloat(data.gszzl.replace("+", "")),
          update_time: data.gztime,
        });
        script.remove();
        delete window.jsonpgz;
      };
      script.onerror = () => {
        reject(new Error("网络错误"));
        script.remove();
        delete window.jsonpgz;
      };
      script.src = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`;
      document.head.appendChild(script);
    });
  } catch (e) {
    console.error("获取失败:", code, e);
    return null;
  }
}

// 刷新所有基金
async function refreshAllFunds() {
  if (fundList.value.length === 0) return;
  loading.value = true;
  const updatedList = [];
  for (const fund of fundList.value) {
    const data = await fetchFundEstimate(fund.code);
    updatedList.push(data || fund); // 若失败保留原数据
  }
  fundList.value = updatedList;
  loading.value = false;
}

// 添加基金
async function addFund() {
  if (!inputCodeStr.value) {
    return;
  }
  const code = inputCodeStr.value.trim();
  if (!/^\d{6}$/.test(code)) {
    showToast({ message: "请输入6位基金代码", type: "warning" });
    return;
  }
  if (fundList.value.some((f) => f.code === code)) {
    showToast({ message: "该基金已存在", type: "warning" });
    return;
  }

  const data = await fetchFundEstimate(code);
  if (data) {
    fundList.value.push(data);
    inputCodeStr.value = "";
    // 保存当前基金代码到 localStorage
    // saveCurrentCodes();
  } else {
    showToast({ message: "基金代码无效或获取失败", type: "error" });
  }
}

// 保存当前基金代码到 localStorage
function saveCurrentCodes() {
  const codes = fundList.value.map((f) => f.code);
  localStorage.setItem("currentCode", JSON.stringify(codes));
}

// 一键复制当前基金代码
function copyCurrentCodes() {
  const codes = fundList.value.map((f) => f.code).join(",");
  navigator.clipboard
    .writeText(codes)
    .then(() => {
      showToast({ message: "复制成功！", type: "success" });
    })
    .catch((err) => {
      console.error("复制失败:", err);
      showToast({ message: "复制失败，请重试", type: "error" });
    });
}
function clearCache() {
  localStorage.setItem("currentCode", JSON.stringify([]));
  fundList.value = [];
  inputCodeStr.value = ''
  defaultCodes.value = code;
  init();
}
// 删除基金
function removeFund(code) {
  fundList.value = fundList.value.filter((f) => f.code !== code);
  // 保存当前基金代码到 localStorage
  saveCurrentCodes();
}

// 处理图片上传
async function handleImageUpload(file) {
  // 显示预览图片
  imageUrl.value = URL.createObjectURL(file);
  // 重置识别结果
  recognitionResult.value = "";
  recognizedCodes.value = [];
  // 开始识别
  await recognizeImage(file);
  // 返回false阻止自动上传
  return false;
}

// 识别图片中的文字
async function recognizeImage(image) {
  recognizing.value = true;
  try {
    // 直接使用 recognize 函数，适配 Tesseract.js 7.0.0 API
    // 尝试更简单的调用方式，只传入图片文件
    const {
      data: { text },
    } = await recognize(image);
    recognitionResult.value = text;

    // 提取6位数字的基金代码
    const codes = text.match(/\b\d{6}\b/g) || [];
    // 去重
    recognizedCodes.value = [...new Set(codes)];
  } catch (error) {
    console.error("图片识别失败:", error);
    showToast({ message: "图片识别失败，请重试", type: "error" });
  } finally {
    recognizing.value = false;
  }
}

// 添加识别的基金
async function addRecognizedFunds() {
  for (const code of recognizedCodes.value) {
    // 检查是否已存在
    if (!fundList.value.some((f) => f.code === code)) {
      const data = await fetchFundEstimate(code);
      if (data) {
        fundList.value.push(data);
      }
    }
  }
  // 保存当前基金代码到 localStorage
  saveCurrentCodes();
  // 重置识别结果
  imageUrl.value = "";
  recognitionResult.value = "";
  recognizedCodes.value = [];
}

// 格式化更新时间，只展示月份和几点，不展示年份
function formatUpdateTime(timeStr) {
  if (!timeStr) return '';
  // 假设时间格式为 "2024-02-02 15:30"
  const parts = timeStr.split(' ');
  if (parts.length < 2) return timeStr;
  
  const datePart = parts[0];
  const timePart = parts[1];
  
  // 提取月份和日期
  const dateParts = datePart.split('-');
  if (dateParts.length < 3) return timeStr;
  
  const month = dateParts[1];
  const day = dateParts[2];
  
  return `${month}-${day} ${timePart}`;
}

// 主题切换
function toggleTheme() {
  const html = document.documentElement;
  if (isDarkTheme.value) {
    html.classList.add("dark");
    document.body.style.backgroundColor = "#121212";
  } else {
    html.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
  }
  // 可以在这里添加本地存储，保存主题设置
  // localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
}

function init() {
  let len = 0;

  timer.value = setInterval(() => {
    if (len >= defaultCodes.value.length) {
      clearInterval(timer.value);
      return;
    }
    inputCodeStr.value = defaultCodes.value[len];
    console.log(inputCodeStr.value);
    addFund();
    len++;
  }, 200);
}
// 自动刷新
onMounted(() => {
  // 初始化主题
  const html = document.documentElement;
  if (isDarkTheme.value) {
    html.classList.add("dark");
    document.body.style.backgroundColor = "#121212";
  } else {
    document.body.style.backgroundColor = "#ffffff";
  }
  init();
  //   timer.value = setInterval(refreshAllFunds, 30_000) // 30秒
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});
</script>

<style scoped>
/* 基础样式 */
.container {
  max-width: 100%;
  margin: 0;
  padding: 16px;
  background-color: #ffffff;
  color: #303133;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

/* 头部区域样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

/* 功能区域样式 */
.function-area {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 添加基金表单样式 */
.add-fund-form {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

/* 输入框与主题切换按钮容器样式 */
.field-with-theme-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

/* 主题切换按钮容器样式 */
.theme-toggle {
  display: flex;
  align-items: center;
}

/* 单元格标签样式 */
.cell-label {
  font-size: 12px;
  line-height: 1.4;
  color: #999;
}

.dark-theme :deep(.cell-label) {
  color: #909399;
}

/* 基金名称样式 */
:deep(.van-cell__title) {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

/* 更新时间文本样式 */
.update-time-text {
  margin-top: 4px;
  display: inline-block;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.button-group .van-button {
  flex: 1;
  min-width: 80px;
  font-size: 12px;
  padding: 6px 8px;
  height: 32px;
  line-height: 32px;
}

/* 图片识别区域样式 */
.image-recognition-area {
  margin-top: 16px;
}

.image-recognition-area h4 {
  margin-bottom: 12px;
  color: #409eff;
  font-size: 16px;
}

/* 标签组样式 */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

/* 基金列表样式 */
.fund-list {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 基金详情样式 */
.fund-details {
  margin-top: 8px;
  font-size: 14px;
}

.fund-net-value {
  margin-bottom: 4px;
  color: #303133;
  font-weight: 500;
}

.fund-change {
  color: #303133;
  margin-bottom: 4px;
  font-weight: 500;
}

.fund-update-time {
  color: #999;
  font-size: 12px;
}

/* 暗黑主题基金详情样式 */
.dark-theme .fund-details {
  color: #e4e7ed;
}

.dark-theme .fund-net-value {
  color: #e4e7ed;
  font-weight: 500;
}

.dark-theme .fund-change {
  color: #e4e7ed;
  font-weight: 500;
}

.dark-theme .fund-update-time {
  color: #909399;
}

/* 图片预览样式 */
.image-preview {
  width: 100px;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* 暗黑主题样式 */
.dark-theme {
  background-color: #1a1a1a;
  color: #e4e7ed;
}

.dark-theme .function-area {
  background-color: #2c2c2c;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.dark-theme .add-fund-form {
  border-bottom: 1px solid #404040;
}

.dark-theme .fund-list {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

/* 暗黑主题Vant组件样式 */
.dark-theme :deep(.van-cell) {
  background-color: #2c2c2c;
  color: #e4e7ed;
  border-bottom: 1px solid #404040;
}

.dark-theme :deep(.van-field__label) {
  color: #e4e7ed;
}

.dark-theme :deep(.van-field__input) {
  color: #e4e7ed;
}

.dark-theme :deep(.van-field__body) {
  background-color: #3a3a3a;
  border-color: #404040;
}

.dark-theme :deep(.van-tag) {
  background-color: #3a3a3a;
  border-color: #404040;
  color: #e4e7ed;
}

/* 响应式调整 - 移动端优先 */
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .function-area {
    padding: 12px;
  }

  .field-with-theme-toggle {
    flex-direction: column;
    align-items: stretch;
  }

  .theme-toggle {
    justify-content: flex-start;
    margin-top: 8px;
  }

  .button-group {
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .button-group .van-button {
    flex: 1;
    min-width: 70px;
    font-size: 11px;
    padding: 0 6px;
    margin-right: 6px !important;
    margin-bottom: 0;
    height: 32px;
    line-height: 32px;
  }

  .button-group .van-button:last-child {
    margin-right: 0 !important;
  }

  /* 图片预览调整 */
  .image-preview {
    max-height: 150px;
  }
}

/* 响应式调整 - 平板和PC端 */
@media (min-width: 769px) {
  .container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
  }

  .header {
    margin-bottom: 24px;
  }

  .function-area {
    padding: 20px;
    margin-bottom: 24px;
  }

  .add-fund-form {
    margin-bottom: 20px;
    padding-bottom: 20px;
  }
}
</style>
