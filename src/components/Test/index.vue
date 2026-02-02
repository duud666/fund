<!-- src/App.vue -->
<template>
  <div class="container" :class="{ 'dark-theme': isDarkTheme }">
    <!-- 头部区域 -->
    <div class="header">
      <!-- 大标题 -->
      <h1 class="main-title">📈 我的基金估值追踪器</h1>
      <!-- 主题切换按钮 -->
      <el-switch
        v-model="isDarkTheme"
        active-text="暗黑"
        inactive-text="浅色"
        @change="toggleTheme"
        style="margin-left: 20px"
      />
    </div>

    <!-- 功能区域 -->
    <div class="function-area">
      <!-- 添加基金区域 -->
      <el-form :inline="true" @submit.prevent="addFund" class="add-fund-form">
        <el-form-item label="基金代码">
          <el-input
            v-model="inputCodeStr"
            placeholder="如 001234"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addFund">添加</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="refreshAllFunds"
            >手动刷新</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button type="success">图片截图识别基金</el-button>
          </el-upload>
        </el-form-item>
        <!-- <el-form-item>
          <el-button type="success" @click="copyCurrentCodes"
            >一键复制</el-button
          >
        </el-form-item>
      -->
          <el-form-item>
          <el-button type="success" @click="clearCache">重置</el-button>
        </el-form-item> 
      </el-form>

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
            <el-tag
              v-for="code in recognizedCodes"
              :key="code"
              style="margin: 5px"
            >
              {{ code }}
            </el-tag>
            <el-button type="primary" @click="addRecognizedFunds">
              添加识别的基金
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 基金列表表格 -->
    <div class="table-container">
      <el-table
        :data="fundList"
        style="width: 100%"
        v-loading="loading"
        class="fund-table"
        max-height="400"
      >
        <el-table-column prop="code" label="基金代码" width="120" />
        <el-table-column prop="name" width="200" label="基金名称" />
        <el-table-column label="估算净值">
          <template #default="{ row }">
            {{ row.estimate_net ? row.estimate_net.toFixed(4) : "--" }}
          </template>
        </el-table-column>
        <el-table-column label="涨跌幅">
          <template #default="{ row }">
            <span
              :style="{ color: row.change_pct > 0 ? '#f56c6c' : '#67c23a' }"
            >
              {{
                row.change_pct
                  ? (row.change_pct >= 0 ? "+" : "") +
                    row.change_pct.toFixed(2) +
                    "%"
                  : "--"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="180" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="removeFund(row.code)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- <div class="footer" style="margin-top: 20px; font-size: 12px; color: #999">
      💡 数据来源：天天基金网（估算净值，非官方净值） | 自动刷新：30秒
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { recognize } from "tesseract.js";
import { ElMessage } from "element-plus";
const savedCodes = JSON.parse(localStorage.getItem("currentCode") || "[]");
const code = ["025857", "001770", "016708", "002610"];
const inputCodeStr = ref(""); // 用户输入的基金代码字符串
const fundList = ref([]);
const loading = ref(false);
const timer = ref(null);
const defaultCodes = ref(savedCodes.length > 0 ? savedCodes : code);
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
    ElMessage.warning("请输入6位基金代码");
    return;
  }
  if (fundList.value.some((f) => f.code === code)) {
    ElMessage.warning("该基金已存在");
    return;
  }

  const data = await fetchFundEstimate(code);
  if (data) {
    fundList.value.push(data);
    inputCodeStr.value = "";
    // 保存当前基金代码到 localStorage
    // saveCurrentCodes();
  } else {
    ElMessage.error("基金代码无效或获取失败");
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
      ElMessage.success("复制成功！");
    })
    .catch((err) => {
      console.error("复制失败:", err);
      ElMessage.error("复制失败，请重试");
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
  imageUrl.value = URL.createObjectURL(file.raw);
  // 重置识别结果
  recognitionResult.value = "";
  recognizedCodes.value = [];
  // 开始识别
  await recognizeImage(file.raw);
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
    ElMessage.error("图片识别失败，请重试");
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
  max-width: 900px;
  margin: 20px;
  padding: 16px;
  background-color: #ffffff;
  color: #303133;
  transition: all 0.3s ease;
}

/* 头部区域样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

/* 大标题样式 */
.main-title {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  flex: 1;
}

/* 功能区域样式 */
.function-area {
  margin-bottom: 24px;
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
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

/* 确保按钮没有不必要的margin-right */
.add-fund-form .asterisk-left {
  margin-right: 0 !important;
}

/* 图片识别区域样式 */
.image-recognition-area {
  margin-top: 16px;
}

.image-recognition-area h3 {
  margin-bottom: 12px;
  color: #409eff;
  font-size: 16px;
}

/* 基金表格样式 */
.fund-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
}

/* 表格容器样式，用于在移动端显示滚动条 */
.table-container {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
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

.dark-theme .main-title {
  color: #e4e7ed;
}

.dark-theme .function-area {
  background-color: #2c2c2c;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.dark-theme .add-fund-form {
  border-bottom: 1px solid #404040;
}

.dark-theme .fund-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.dark-theme .table-container {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

/* 暗黑主题表格样式 */
.dark-theme .el-table {
  background-color: #2c2c2c;
  color: #e4e7ed;
}

.dark-theme .el-table th {
  background-color: #3a3a3a;
  color: #e4e7ed;
  border-bottom: 1px solid #404040;
}

.dark-theme .el-table td {
  border-bottom: 1px solid #404040;
}

.dark-theme .el-table tr:hover > td {
  background-color: #3a3a3a !important;
}

.dark-theme .el-table__empty-block {
  background-color: #2c2c2c;
}

.dark-theme .el-table__empty-text {
  color: #909399;
}

/* 暗黑主题表单样式 */
.dark-theme .el-input__wrapper {
  background-color: #3a3a3a;
  border-color: #404040;
}

.dark-theme .el-input__wrapper:hover {
  border-color: #606266;
}

.dark-theme .el-input__input {
  color: #e4e7ed;
}

.dark-theme .el-form-item__label {
  color: #e4e7ed;
}

/* 移除自定义的暗黑主题按钮样式，使用Element Plus的默认主题样式 */

/* 暗黑主题标签样式 */
.dark-theme .el-tag {
  background-color: #3a3a3a;
  border-color: #404040;
  color: #e4e7ed;
}

/* 响应式调整 - PC端 */
@media (min-width: 769px) {
  .container {
    margin: 40px auto;
    padding: 20px;
  }

  .header {
    margin-bottom: 30px;
  }

  .main-title {
    font-size: 28px;
  }

  .function-area {
    padding: 20px;
    margin-bottom: 30px;
  }

  .add-fund-form {
    margin-bottom: 20px;
    padding-bottom: 20px;
  }
}

/* 响应式调整 - 平板端 */
@media (max-width: 768px) {
  .container {
    margin: 20px;
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .main-title {
    font-size: 20px;
    margin-bottom: 0;
  }

  .function-area {
    padding: 16px;
  }

  .add-fund-form {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .el-form-item {
    margin-bottom: 0;
  }

  .el-input {
    width: 100%;
  }

  .el-button {
    width: 100%;
  }
}

/* 响应式调整 - 移动端 */
@media (max-width: 480px) {
  .container {
    margin: 12px;
    padding: 12px;
  }

  .main-title {
    font-size: 18px;
  }

  .function-area {
    padding: 12px;
  }

  .image-recognition-area h3 {
    font-size: 14px;
  }

  /* 表格列调整 */
  .el-table {
    font-size: 12px;
  }

  .el-table th,
  .el-table td {
    padding: 8px;
  }

  /* 图片预览调整 */
  .image-preview {
    max-height: 150px;
  }
}
</style>
