<script setup>
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <img src="/images/1.png" alt="杭州电子科技大学信息工程学院校徽" />
        </div>
        <div>
          <h1>杭州电子科技大学信息工程学院校园失物招领系统</h1>
          <p>Lost &amp; Found · 温暖每一次团聚</p>
        </div>
      </div>
    </header>

    <main class="app-content">
      <RouterView />
    </main>

    <footer class="app-footer">
      <span>© {{ new Date().getFullYear() }} 杭州电子科技大学信息工程学院</span>
      <span>服务热线：0571-8691-8888</span>
    </footer>
  </div>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 16px 0;
  max-width: 1280px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.logo {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  box-shadow: 0 10px 25px rgba(31, 111, 235, 0.35);
  background: #fff;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 14px;
}

h1 {
  margin: 0;
  font-size: clamp(20px, 2vw, 26px);
}

p {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-size: 14px;
}


.app-footer {
  padding: 24px 16px 32px;
  color: var(--color-muted);
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app-header {
    padding: 20px 12px 0;
  }


  .app-footer {
    padding: 16px 12px 24px;
    font-size: 12px;
    justify-content: center;
    text-align: center;
  }
}
</style>
