<template>
  <div>
    <h2 style="margin-bottom: 20px">文件管理</h2>
    <n-card>
      <n-result status="info" title="功能开发中" description="文件管理将在后续版本中提供">
        <template #footer>
          <n-button @click="$router.push('/dashboard')">返回仪表盘</n-button>
        </template>
      </n-result>
    </n-card>
  </div>
</template>

<script setup lang="ts">
</script>
