<script setup>

</script>

<template>
  <header class="border-bottom fixed-top bg-body-tertiary">
    <nav class="navbar">
      <div class="container-fluid">
        <button class="btn border-0 pe-4" type="button" data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fs-3 fw-bold" href="#">Quizzes</a>
        <div class="dropdown ms-auto">
          <button class="btn border-0 user-profile-btn" id="dropdown1"
             data-bs-toggle="dropdown" aria-expanded="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            </svg>
          </button>
          <ul class="dropdown-menu dropdown-menu-end mt-1" aria-labelledby="dropdown1" style="">
            <li><a class="dropdown-item" href="#">Profile</a></li>
            <li><a class="dropdown-item" href="#">Settings</a></li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li><a class="dropdown-item" href="#">Sign out</a></li>
          </ul>
        </div>
      </div>
      <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasWithBothOptions"
           aria-labelledby="offcanvasWithBothOptionsLabel">
        <div class="offcanvas-header">
          <a class="navbar-brand fs-2 fw-bold" href="#">Quizzes</a>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body pt-0">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link active fs-5" href="#">About</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active fs-5" href="#">Users</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active fs-5" href="#">Companies</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
  .user-profile-btn.show {
    background-color: #dee2e6;
  }
</style>