<template>
  <div class="min-h-screen bg-white dark:bg-gray-950" :class="themeStore.isDark ? 'dark' : ''">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          <a href="#home" class="flex items-center">
            <img src="@/logo/Group 16.svg" alt="Mouraqib" class="h-8 w-auto" />
          </a>

          <div class="hidden md:flex items-center space-x-8">
            <a href="#problem" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pourquoi nous</a>
            <a href="#features" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#solutions" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Tarifs</a>
          </div>

          <div class="flex items-center space-x-4">
            <button
              @click="themeStore.toggleTheme"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Moon v-if="!themeStore.isDark" class="w-5 h-5" />
              <Sun v-else class="w-5 h-5" />
            </button>
            <router-link to="/signin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Connexion
            </router-link>
            <router-link to="/signup" class="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Essai gratuit
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      <!-- Background decorative elements -->
      <div class="absolute top-20 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl -z-10"></div>

      <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left content -->
          <div>
            <div class="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-full mb-6 border border-orange-200/50 dark:border-orange-700/30">
              <span class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <span class="text-xs font-medium text-orange-700 dark:text-orange-400">Nouveau</span>
              <span class="text-xs text-orange-600 dark:text-orange-500">Intégration API en 3 minutes</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Gardez le <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">contrôle total</span> sur chaque colis
            </h1>

            <p class="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
              Transparence complète sur vos expéditions. Vérifiez chaque pickup, chaque livraison, chaque retour.
              Rapports détaillés et pointage en 3 minutes.
            </p>

            <div class="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <router-link to="/signup" class="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center space-x-2">
                <span>Commencer gratuitement</span>
                <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </router-link>
              <a href="#demo" class="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-2 group">
                <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                  <Play class="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-orange-600" />
                </div>
                <span>Voir la démo</span>
              </a>
            </div>

            <div class="mt-12 flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              <div class="flex items-center space-x-2">
                <div class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check class="w-3 h-3 text-green-600" />
                </div>
                <span>Sans carte bancaire</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check class="w-3 h-3 text-green-600" />
                </div>
                <span>Configuration en 3 min</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check class="w-3 h-3 text-green-600" />
                </div>
                <span>Support inclus</span>
              </div>
            </div>
          </div>

          <!-- Right illustration -->
          <div class="hidden lg:block relative">
            <div class="relative">
              <!-- Main illustration card -->
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 p-6 border border-gray-100 dark:border-gray-700">
                <!-- App header with logo -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-2">
                    <img src="@/logo/Group 14.svg" alt="Mouraqib" class="h-6" />
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Bell class="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <!-- Balance cards -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                    <div class="flex items-center justify-between mb-2">
                      <Package class="w-5 h-5 text-orange-500" />
                      <span class="text-xs text-orange-600 font-medium">Livré</span>
                    </div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">847</div>
                    <div class="text-xs text-gray-500">colis restants</div>
                    <div class="mt-2 h-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
                      <div class="h-full bg-orange-500 rounded-full" style="width: 42%"></div>
                    </div>
                  </div>
                  <div class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div class="flex items-center justify-between mb-2">
                      <RefreshCw class="w-5 h-5 text-gray-500" />
                      <span class="text-xs text-gray-500 font-medium">Retour</span>
                    </div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">156</div>
                    <div class="text-xs text-gray-500">colis restants</div>
                    <div class="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-gray-500 rounded-full" style="width: 31%"></div>
                    </div>
                  </div>
                </div>

                <!-- Recharge button -->
                <button class="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Wallet class="w-4 h-4" />
                  Recharger mon solde
                </button>

                <!-- Recent activity -->
                <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div class="text-xs text-gray-500 mb-2">Consommation récente</div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-gray-600 dark:text-gray-400">TN-2024-8847</span>
                      <span class="text-orange-500 font-medium">-1 livré</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-gray-600 dark:text-gray-400">TN-2024-8846</span>
                      <span class="text-gray-500 font-medium">-1 retour</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Floating recharge notification -->
              <div class="absolute -right-4 top-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-100 dark:border-gray-700 animate-bounce-slow">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Check class="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div class="text-xs font-medium text-gray-900 dark:text-white">+500 colis ajoutés!</div>
                    <div class="text-xs text-gray-500">Solde rechargé</div>
                  </div>
                </div>
              </div>

              <!-- Floating balance alert -->
              <div class="absolute -left-8 bottom-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-100 dark:border-gray-700">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Bell class="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div class="text-xs font-medium text-gray-900 dark:text-white">Solde bas</div>
                    <div class="text-xs text-gray-500">Rechargez bientôt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors group">
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users class="w-6 h-6 text-orange-600" />
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">500+</div>
            <div class="mt-1 text-sm text-gray-500">E-commerçants actifs</div>
          </div>
          <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors group">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package class="w-6 h-6 text-blue-600" />
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">2M+</div>
            <div class="mt-1 text-sm text-gray-500">Colis suivis</div>
          </div>
          <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors group">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingDown class="w-6 h-6 text-green-600" />
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">40%</div>
            <div class="mt-1 text-sm text-gray-500">Réduction des retours</div>
          </div>
          <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors group">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock class="w-6 h-6 text-purple-600" />
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white">2h/jour</div>
            <div class="mt-1 text-sm text-gray-500">Temps économisé</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Countdown Timer -->
    <section class="py-12 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg shadow-orange-500/25">
          <h2 class="text-xl font-semibold text-white text-center mb-6">Lancement dans</h2>
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.days).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">Jours</span>
            </div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.hours).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">Heures</span>
            </div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.minutes).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">Minutes</span>
            </div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
                <span class="text-3xl sm:text-4xl font-bold text-white">{{ String(countdown.seconds).padStart(2, '0') }}</span>
              </div>
              <span class="text-sm text-white/80">Secondes</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem Section -->
    <section id="problem" class="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-10 left-10 w-20 h-20 border border-red-200 dark:border-red-900/30 rounded-full opacity-50"></div>
      <div class="absolute bottom-20 right-20 w-32 h-32 border border-red-200 dark:border-red-900/30 rounded-full opacity-30"></div>

      <div class="max-w-6xl mx-auto">
        <div class="max-w-2xl mb-12">
          <div class="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <X class="w-4 h-4 text-red-600" />
            <span class="text-sm font-medium text-red-700 dark:text-red-400">Les défis du e-commerce tunisien</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Le problème que vous connaissez <span class="text-red-500">trop bien</span>
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Chaque jour, vous perdez du temps et de l'argent à cause d'une gestion logistique fragmentée.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">5 dashboards différents</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Vous passez d'Aramex à MayDay, puis Sawa Express... Chaque transporteur a son propre système.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">"Où est mon colis ?"</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Vos clients vous appellent 10 fois par jour. Vous passez votre temps à chercher l'info au lieu de vendre.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Pas de visibilité financière</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Combien vous doit chaque transporteur ? Quels paiements sont en retard ? Impossible à savoir rapidement.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Taux de retour élevé</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Sans notifications proactives, vos clients ne sont pas préparés. Les échecs de livraison s'accumulent.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Aucune analyse</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Quel transporteur performe le mieux ? Quelles zones ont le plus de problèmes ? Vous naviguez à l'aveugle.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Équipe dans le flou</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Vos collaborateurs n'ont pas accès aux bonnes infos. Vous devez tout centraliser vous-même.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Impossible de tout vérifier</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Pickups, retours, paiements... Sans outil de vérification, des erreurs passent inaperçues et vous perdez de l'argent.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Tâches quotidiennes floues</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Quoi faire aujourd'hui ? Quels clients rappeler ? Quels colis suivre en priorité ? Vous improvisez chaque matin.
            </p>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <X class="w-5 h-5 text-red-600" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Heures perdues en saisie manuelle</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Copier-coller des numéros de suivi, remplir des tableaux Excel... Un travail répétitif qui vous épuise.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Solution Section -->
    <section class="py-20 px-4 sm:px-6 relative overflow-hidden">
      <!-- Decorative gradient -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-100/50 to-transparent dark:from-orange-900/10 dark:to-transparent rounded-full blur-3xl -z-10"></div>

      <div class="max-w-6xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <div class="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check class="w-4 h-4 text-green-600" />
            <span class="text-sm font-medium text-green-700 dark:text-green-400">La solution</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Une plateforme. <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Tous vos transporteurs.</span>
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Mouraqib connecte automatiquement tous vos comptes transporteurs et vous donne une vue unifiée en temps réel.
          </p>
        </div>

        <!-- How it works -->
        <div class="grid md:grid-cols-3 gap-8 relative">
          <!-- Connection line -->
          <div class="hidden md:block absolute top-6 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 dark:from-orange-900/30 dark:via-orange-600 dark:to-orange-900/30"></div>

          <div class="text-center relative">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-orange-500/30 relative z-10">1</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connectez vos transporteurs</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Aramex, MayDay, Sawa Express, et tous les autres. Intégration en moins de 3 minutes via notre API.
            </p>
          </div>
          <div class="text-center relative">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-orange-500/30 relative z-10">2</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Centralisez tout</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Tous vos colis, pickups, retours et paiements apparaissent dans un seul dashboard unifié.
            </p>
          </div>
          <div class="text-center relative">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-orange-500/30 relative z-10">3</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Automatisez et analysez</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Notifications automatiques à vos clients, KPIs en temps réel, et rapports financiers détaillés.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section - ixmoove style -->
    <section id="features" class="py-24 px-4 sm:px-6 bg-white dark:bg-gray-950">
      <div class="max-w-6xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Une plateforme complète pour gérer votre logistique de bout en bout.
          </p>
        </div>

        <!-- First row - 3 cards -->
        <div class="grid md:grid-cols-3 gap-6 mb-6">
          <!-- Feature 1 - Dashboard unifié -->
          <div class="rounded-3xl p-8 bg-cyan-50 dark:bg-cyan-950/30">
            <!-- Illustration -->
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                <Layers class="w-10 h-10 text-cyan-500" />
              </div>
              <!-- Floating elements -->
              <div class="absolute top-4 right-8 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-md flex items-center space-x-2">
                <div class="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Check class="w-3 h-3 text-white" />
                </div>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Unifié</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Dashboard unifié</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Tous vos colis de tous vos transporteurs en un seul endroit. Filtrez par statut, date, transporteur ou client.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Découvrir
            </button>
          </div>

          <!-- Feature 2 - Notifications -->
          <div class="rounded-3xl p-8 bg-slate-50 dark:bg-slate-900/30">
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <!-- Mini window illustration -->
              <div class="w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3">
                <div class="flex items-center space-x-1 mb-2">
                  <div class="w-2 h-2 rounded-full bg-red-400"></div>
                  <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div class="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div class="space-y-2">
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="flex items-center space-x-1">
                    <Bell class="w-3 h-3 text-blue-500" />
                    <div class="h-2 bg-blue-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div class="absolute bottom-8 left-8 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-md flex items-center space-x-2">
                <MessageSquare class="w-4 h-4 text-green-500" />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">SMS</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Notifications automatiques</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              SMS et WhatsApp envoyés automatiquement à vos clients à chaque étape. Réduisez les appels de 80%.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              En savoir plus
            </button>
          </div>

          <!-- Feature 3 - Suivi financier -->
          <div class="rounded-3xl p-8 bg-orange-50 dark:bg-orange-950/30">
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                <Wallet class="w-10 h-10 text-orange-500" />
              </div>
              <!-- Floating cards -->
              <div class="absolute top-2 right-4 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-md">
                <span class="text-xs font-bold text-orange-500">+2,500 TND</span>
              </div>
              <div class="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-md">
                <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Paiements</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Suivi financier</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Cash collecté, paiements attendus, écarts, retours. Une vision claire de vos flux financiers.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Découvrir
            </button>
          </div>
        </div>

        <!-- Second row - 3 cards -->
        <div class="grid md:grid-cols-3 gap-6 mb-6">
          <!-- Feature 4 - KPIs -->
          <div class="rounded-3xl p-8 bg-green-50 dark:bg-green-950/30">
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                <TrendingUp class="w-10 h-10 text-green-500" />
              </div>
              <div class="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-md">
                <span class="text-lg font-bold text-green-500">94%</span>
              </div>
              <div class="absolute bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 shadow-md">
                <BarChart3 class="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">KPIs & Analytics</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Taux de livraison, délais moyens, taux de retour par zone. Identifiez les problèmes rapidement.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Découvrir
            </button>
          </div>

          <!-- Feature 5 - Pointage -->
          <div class="rounded-3xl p-8 bg-purple-50 dark:bg-purple-950/30">
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                <RefreshCw class="w-10 h-10 text-purple-500" />
              </div>
              <div class="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
                <ScanLine class="w-5 h-5 text-purple-500" />
              </div>
              <div class="absolute bottom-4 left-6 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-md flex items-center space-x-2">
                <Check class="w-4 h-4 text-green-500" />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Vérifié</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Pointage en 3 min</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Rapport complet avec scan code-barres. Vérifiez chaque pickup et retour. Zéro erreur.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              En savoir plus
            </button>
          </div>

          <!-- Feature 6 - Équipe -->
          <div class="rounded-3xl p-8 bg-blue-50 dark:bg-blue-950/30">
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                <Users class="w-10 h-10 text-blue-500" />
              </div>
              <div class="absolute top-6 left-6 flex -space-x-2">
                <div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">A</div>
                <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">S</div>
                <div class="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">K</div>
              </div>
              <div class="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 shadow-md">
                <Shield class="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Gestion d'équipe</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Créez des comptes pour vos collaborateurs avec des permissions personnalisées.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Découvrir
            </button>
          </div>
        </div>

        <!-- Third row - 2 wider cards -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Feature 7 - Page de suivi -->
          <div class="rounded-3xl p-8 bg-pink-50 dark:bg-pink-950/30">
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <div class="w-24 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3">
                <div class="w-full h-2 bg-pink-200 rounded mb-2"></div>
                <div class="flex items-center justify-between mb-2">
                  <Package class="w-4 h-4 text-pink-500" />
                  <div class="h-1 w-8 bg-pink-300 rounded"></div>
                  <Check class="w-4 h-4 text-green-500" />
                </div>
                <div class="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div class="absolute top-4 right-12 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-md">
                <span class="text-xs font-medium text-pink-600">Lien de suivi</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Page de suivi client</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Chaque client reçoit un lien de suivi en temps réel. Plus besoin de vous appeler pour savoir où est son colis.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Découvrir
            </button>
          </div>

          <!-- Feature 8 - API -->
          <div class="rounded-3xl p-8 bg-amber-50 dark:bg-amber-950/30">
            <div class="h-48 flex items-center justify-center mb-6 relative">
              <div class="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
                <Zap class="w-10 h-10 text-amber-500" />
              </div>
              <div class="absolute top-4 left-8 bg-gray-900 dark:bg-gray-700 rounded-lg px-3 py-2 shadow-md">
                <code class="text-xs text-green-400">API</code>
              </div>
              <div class="absolute bottom-6 right-8 flex space-x-1">
                <div class="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-xs font-bold text-orange-600">A</div>
                <div class="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-600">M</div>
                <div class="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-xs font-bold text-green-600">S</div>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">API universelle</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Changez de transporteur sans changer de système. Notre API s'adapte à tous les prestataires tunisiens.
            </p>
            <button class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Documentation
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Integrations -->
    <section class="py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div class="max-w-6xl mx-auto text-center">
        <div class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <Link class="w-4 h-4 text-blue-600" />
          <span class="text-sm font-medium text-blue-700 dark:text-blue-400">Intégrations</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Compatible avec tous les transporteurs tunisiens
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-10">
          Connectez vos comptes en quelques clics
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <div class="group px-6 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300">
            <span class="text-gray-700 dark:text-gray-300 font-semibold group-hover:text-orange-600 transition-colors">Aramex</span>
          </div>
          <div class="group px-6 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300">
            <span class="text-gray-700 dark:text-gray-300 font-semibold group-hover:text-orange-600 transition-colors">MayDay</span>
          </div>
          <div class="group px-6 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300">
            <span class="text-gray-700 dark:text-gray-300 font-semibold group-hover:text-orange-600 transition-colors">Sawa Express</span>
          </div>
          <div class="group px-6 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300">
            <span class="text-gray-700 dark:text-gray-300 font-semibold group-hover:text-orange-600 transition-colors">DHL</span>
          </div>
          <div class="group px-6 py-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300">
            <span class="text-gray-700 dark:text-gray-300 font-semibold group-hover:text-orange-600 transition-colors">Fedex</span>
          </div>
          <div class="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
            <span class="text-white font-semibold">+ 15 autres</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Solutions Section -->
    <section id="solutions" class="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-6xl mx-auto">
        <div class="max-w-2xl mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            Adapté à votre activité
          </h2>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            Que vous expédiez 50 ou 5000 colis par mois, notre plateforme évolue avec vous.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            @click="activeSolution = 'ecommerce'"
            class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <ShoppingCart class="w-8 h-8 text-gray-700 dark:text-gray-300 mb-4" />
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">E-commerçants</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Vendeurs en ligne avec plusieurs transporteurs qui veulent tout centraliser.
            </p>
            <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              En savoir plus <ChevronRight class="w-4 h-4 ml-1" />
            </span>
          </div>

          <div
            @click="activeSolution = 'delivery'"
            class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <Truck class="w-8 h-8 text-gray-700 dark:text-gray-300 mb-4" />
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Sociétés de livraison</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Offrez un outil de tracking moderne à vos clients e-commerçants.
            </p>
            <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              En savoir plus <ChevronRight class="w-4 h-4 ml-1" />
            </span>
          </div>

          <div
            @click="activeSolution = 'marketplace'"
            class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <Store class="w-8 h-8 text-gray-700 dark:text-gray-300 mb-4" />
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Marketplaces</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Plateformes multi-vendeurs avec suivi centralisé et dashboards individuels.
            </p>
            <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              En savoir plus <ChevronRight class="w-4 h-4 ml-1" />
            </span>
          </div>

          <div
            @click="activeSolution = 'brand'"
            class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <Building class="w-8 h-8 text-gray-700 dark:text-gray-300 mb-4" />
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Marques & Retail</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Expérience post-achat premium avec page de suivi brandée.
            </p>
            <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              En savoir plus <ChevronRight class="w-4 h-4 ml-1" />
            </span>
          </div>

          <div
            @click="activeSolution = 'wholesale'"
            class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <Package class="w-8 h-8 text-gray-700 dark:text-gray-300 mb-4" />
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Grossistes</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Traçabilité B2B complète pour vos expéditions vers revendeurs.
            </p>
            <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              En savoir plus <ChevronRight class="w-4 h-4 ml-1" />
            </span>
          </div>

          <div
            @click="activeSolution = 'social'"
            class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <Smartphone class="w-8 h-8 text-gray-700 dark:text-gray-300 mb-4" />
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Social Sellers</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Solution simple pour vendeurs Instagram et Facebook.
            </p>
            <span class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              En savoir plus <ChevronRight class="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 px-4 sm:px-6 relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-20 left-10 w-20 h-20 border border-orange-200 dark:border-orange-900/30 rounded-full opacity-50"></div>
      <div class="absolute bottom-20 right-10 w-32 h-32 border border-orange-200 dark:border-orange-900/30 rounded-full opacity-30"></div>

      <div class="max-w-6xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <div class="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Star class="w-4 h-4 text-purple-600" />
            <span class="text-sm font-medium text-purple-700 dark:text-purple-400">Témoignages</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Ils ont transformé leur <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">logistique</span>
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-xl transition-all duration-300 relative">
            <!-- Quote icon -->
            <div class="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <Quote class="w-4 h-4 text-white" />
            </div>
            <div class="flex mb-4">
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              "Avant Mouraqib, je passais 2h par jour à vérifier les statuts sur 4 sites différents. Maintenant tout est là, en un clic. Mon taux de retour est passé de 32% à 19%."
            </p>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span class="font-bold text-white">A</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">Ahmed B.</div>
                <div class="text-sm text-gray-500">E-commerce Mode, 800 colis/mois</div>
              </div>
            </div>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-xl transition-all duration-300 relative">
            <div class="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <Quote class="w-4 h-4 text-white" />
            </div>
            <div class="flex mb-4">
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              "Les notifications WhatsApp automatiques ont tout changé. Mes clients sont prévenus à chaque étape, je ne reçois presque plus d'appels pour savoir où est leur commande."
            </p>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                <span class="font-bold text-white">S</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">Sarah M.</div>
                <div class="text-sm text-gray-500">Cosmétiques en ligne, 400 colis/mois</div>
              </div>
            </div>
          </div>

          <div class="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-xl transition-all duration-300 relative">
            <div class="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <Quote class="w-4 h-4 text-white" />
            </div>
            <div class="flex mb-4">
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              "Le suivi financier m'a permis de détecter des écarts de paiement que je n'aurais jamais vus autrement. J'ai récupéré 2000 TND en un mois."
            </p>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span class="font-bold text-white">K</span>
              </div>
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">Karim T.</div>
                <div class="text-sm text-gray-500">Electronics Store, 1200 colis/mois</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-6xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            Tarification simple et transparente
          </h2>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            Achetez vos crédits et utilisez-les quand vous voulez. Pas d'abonnement, pas de limite mensuelle.
          </p>
          <!-- Free offer badge -->
          <div class="inline-flex items-center mt-6 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
            <span class="text-green-700 dark:text-green-400 font-semibold text-sm">500 premiers colis OFFERTS</span>
          </div>
        </div>

        <!-- Simple Pricing Cards -->
        <div class="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <!-- Colis Livré -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-orange-500 text-center">
            <div class="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package class="w-8 h-8 text-orange-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Colis Livré</h3>
            <div class="mb-4">
              <span class="text-4xl font-bold text-gray-900 dark:text-white">{{ CREDIT_PRICE_DELIVERED_MILLIMES }}</span>
              <span class="text-lg text-gray-500"> millimes</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">par colis livré avec succès</p>
          </div>

          <!-- Colis Retour -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw class="w-8 h-8 text-gray-500" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Colis Retour</h3>
            <div class="mb-4">
              <span class="text-4xl font-bold text-gray-900 dark:text-white">{{ CREDIT_PRICE_RETURNED_MILLIMES }}</span>
              <span class="text-lg text-gray-500"> millimes</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">par colis retourné</p>
          </div>
        </div>

        <!-- Balance Info -->
        <div class="max-w-2xl mx-auto mb-8">
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-start gap-3">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Wallet class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white text-sm">Système de solde prépayé</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Rechargez votre solde à tout moment et suivez votre nombre de colis restants directement dans l'application. Pas d'abonnement, payez uniquement ce que vous utilisez.
              </p>
            </div>
          </div>
        </div>

        <!-- Calculator & CTA -->
        <div class="max-w-2xl mx-auto">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">Estimez votre coût</h3>

            <div class="space-y-6 mb-6">
              <div>
                <div class="flex justify-between items-center mb-3">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Colis livrés</label>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">{{ deliveredCount.toLocaleString() }}</span>
                </div>
                <input
                  v-model.number="deliveredCount"
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                />
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>2.5k</span>
                  <span>5k</span>
                  <span>7.5k</span>
                  <span>10k</span>
                </div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-3">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Colis retournés</label>
                  <span class="text-lg font-bold text-gray-900 dark:text-white">{{ returnedCount.toLocaleString() }}</span>
                </div>
                <input
                  v-model.number="returnedCount"
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                />
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>500</span>
                  <span>1k</span>
                  <span>1.5k</span>
                  <span>2k</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ deliveredCount }} livrés × 100 mill</span>
                  <span class="text-gray-700 dark:text-gray-300">{{ (deliveredCount * 0.1).toFixed(3) }} TND</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ returnedCount }} retours × 50 mill</span>
                  <span class="text-gray-700 dark:text-gray-300">{{ (returnedCount * 0.05).toFixed(3) }} TND</span>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-700 dark:text-gray-300 font-medium">Total</span>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ calculatedPrice.toFixed(3) }} <span class="text-lg font-normal">TND</span></span>
                  </div>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-3">* 500 premiers colis offerts déduits automatiquement</p>
            </div>

            <router-link to="/signup" class="block w-full py-4 text-center bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
              Commencer gratuitement
            </router-link>

            <div class="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <Check class="w-4 h-4" />
                <span>Sans engagement</span>
              </div>
              <div class="flex items-center space-x-2">
                <Check class="w-4 h-4" />
                <span>Sans limite mensuelle</span>
              </div>
              <div class="flex items-center space-x-2">
                <Check class="w-4 h-4" />
                <span>Support inclus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20 px-4 sm:px-6">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Questions fréquentes
        </h2>

        <div class="space-y-6">
          <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Comment ça marche techniquement ?</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Vous nous donnez vos identifiants transporteurs (ou utilisez notre API). Nous synchronisons automatiquement tous vos colis et statuts en temps réel.
            </p>
          </div>

          <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Combien de temps pour l'intégration ?</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Moins de 3 minutes pour la plupart des transporteurs. Vous pouvez commencer à utiliser la plateforme immédiatement après.
            </p>
          </div>

          <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Mes données sont-elles sécurisées ?</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Oui, toutes les données sont chiffrées et stockées sur des serveurs sécurisés. Nous ne partageons jamais vos informations avec des tiers.
            </p>
          </div>

          <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Y a-t-il un engagement minimum ?</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Non, vous payez uniquement à l'usage. Pas d'abonnement fixe, pas de frais d'installation, pas d'engagement. Vous pouvez arrêter quand vous voulez.
            </p>
          </div>

          <div class="pb-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Quel support est inclus ?</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Support par email et WhatsApp inclus pour tous les clients. Réponse garantie sous 24h ouvrées.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 px-4 sm:px-6 relative overflow-hidden" style="background-color: #222628;">
      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/4 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      <div class="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-400 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
      <div class="absolute bottom-1/3 left-1/3 w-2 h-2 bg-orange-300 rounded-full animate-pulse" style="animation-delay: 1s"></div>

      <div class="max-w-3xl mx-auto text-center relative">
        <div class="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500/20 rounded-full mb-6 border border-orange-500/30">
          <Zap class="w-4 h-4 text-orange-400" />
          <span class="text-sm font-medium text-orange-400">Commencez dès maintenant</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          Prêt à simplifier votre logistique ?
        </h2>
        <p class="text-gray-400 mb-10 text-lg">
          Rejoignez les 500+ e-commerçants tunisiens qui ont déjà centralisé leur gestion de livraison.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link to="/signup" class="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center space-x-2">
            <span>Commencer gratuitement</span>
            <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </router-link>
          <a href="#pricing" class="px-8 py-4 text-gray-300 font-medium hover:text-white transition-colors border border-gray-700 hover:border-gray-600 rounded-xl">
            Voir les tarifs
          </a>
        </div>
        <p class="mt-6 text-sm text-gray-500">500 premiers colis offerts • Sans engagement</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 sm:px-6 border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <img src="@/logo/Group 16.svg" alt="Mouraqib" class="h-8 w-auto mb-4" />
            <p class="text-sm text-gray-500">
              Plateforme de tracking multi-transporteurs pour e-commerçants tunisiens.
            </p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Produit</h4>
            <ul class="space-y-2 text-sm text-gray-500">
              <li><a href="#features" class="hover:text-gray-900 dark:hover:text-white">Fonctionnalités</a></li>
              <li><a href="#pricing" class="hover:text-gray-900 dark:hover:text-white">Tarifs</a></li>
              <li><a href="#" class="hover:text-gray-900 dark:hover:text-white">API</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Solutions</h4>
            <ul class="space-y-2 text-sm text-gray-500">
              <li><a href="#solutions" class="hover:text-gray-900 dark:hover:text-white">E-commerçants</a></li>
              <li><a href="#solutions" class="hover:text-gray-900 dark:hover:text-white">Transporteurs</a></li>
              <li><a href="#solutions" class="hover:text-gray-900 dark:hover:text-white">Marketplaces</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Contact</h4>
            <ul class="space-y-2 text-sm text-gray-500">
              <li>contact@mouraqib.com</li>
              <li>+216 XX XXX XXX</li>
            </ul>
          </div>
        </div>
        <div class="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
          &copy; 2025 Mouraqib. Tous droits réservés.
        </div>
      </div>
    </footer>

    <!-- Solution Modal -->
    <Teleport to="body">
      <div
        v-if="activeSolution"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="activeSolution = null"
      >
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <button
            @click="activeSolution = null"
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="p-8">
            <!-- E-commerce -->
            <template v-if="activeSolution === 'ecommerce'">
              <ShoppingCart class="w-10 h-10 text-gray-700 dark:text-gray-300 mb-4" />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les E-commerçants</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Vous travaillez avec Aramex, MayDay, Sawa Express ? Arrêtez de perdre du temps sur 5 dashboards différents.
              </p>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Tous vos colis en un seul endroit</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Notifications automatiques à vos clients</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Suivi financier par transporteur</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">KPIs et analyses de performance</span>
                </li>
              </ul>
              <router-link to="/signup" @click="activeSolution = null" class="block w-full py-3 text-center bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600">
                Commencer gratuitement
              </router-link>
            </template>

            <!-- Delivery -->
            <template v-if="activeSolution === 'delivery'">
              <Truck class="w-10 h-10 text-gray-700 dark:text-gray-300 mb-4" />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les Sociétés de Livraison</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Offrez un outil de tracking moderne à vos clients e-commerçants sans développer votre propre solution.
              </p>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Plateforme clé en main</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Réduisez les appels service client</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Marque blanche disponible</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Différenciez-vous de la concurrence</span>
                </li>
              </ul>
              <a href="#pricing" @click="activeSolution = null" class="block w-full py-3 text-center bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600">
                Nous contacter
              </a>
            </template>

            <!-- Marketplace -->
            <template v-if="activeSolution === 'marketplace'">
              <Store class="w-10 h-10 text-gray-700 dark:text-gray-300 mb-4" />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les Marketplaces</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Gérez les expéditions de centaines de vendeurs avec une vue consolidée.
              </p>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Dashboard admin global</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Accès vendeur avec permissions</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">KPIs par vendeur et globaux</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">API et webhooks</span>
                </li>
              </ul>
              <a href="#pricing" @click="activeSolution = null" class="block w-full py-3 text-center bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600">
                Demander une démo
              </a>
            </template>

            <!-- Brand -->
            <template v-if="activeSolution === 'brand'">
              <Building class="w-10 h-10 text-gray-700 dark:text-gray-300 mb-4" />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les Marques & Retail</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Offrez une expérience post-achat premium à vos clients.
              </p>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Page de suivi brandée</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Domaine personnalisé</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Intégration ERP et WMS</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Support dédié et SLA</span>
                </li>
              </ul>
              <a href="#pricing" @click="activeSolution = null" class="block w-full py-3 text-center bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600">
                Nous contacter
              </a>
            </template>

            <!-- Wholesale -->
            <template v-if="activeSolution === 'wholesale'">
              <Package class="w-10 h-10 text-gray-700 dark:text-gray-300 mb-4" />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les Grossistes</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Traçabilité B2B complète pour vos expéditions vers revendeurs.
              </p>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Suivi vers revendeurs</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Gestion des retours</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Rapports par client B2B</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Suivi des encaissements</span>
                </li>
              </ul>
              <router-link to="/signup" @click="activeSolution = null" class="block w-full py-3 text-center bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600">
                Essayer gratuitement
              </router-link>
            </template>

            <!-- Social -->
            <template v-if="activeSolution === 'social'">
              <Smartphone class="w-10 h-10 text-gray-700 dark:text-gray-300 mb-4" />
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les Social Sellers</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Solution simple pour vendeurs Instagram et Facebook.
              </p>
              <ul class="space-y-3 mb-6">
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Interface simple</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Gratuit pour démarrer</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Lien de suivi pour vos clients</span>
                </li>
                <li class="flex items-start space-x-3">
                  <Check class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-600 dark:text-gray-400">Paraissez plus professionnel</span>
                </li>
              </ul>
              <router-link to="/signup" @click="activeSolution = null" class="block w-full py-3 text-center bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600">
                Commencer gratuitement
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import {
  Moon,
  Sun,
  Play,
  Check,
  X,
  ChevronRight,
  Layers,
  Bell,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Link,
  RefreshCw,
  Zap,
  ShoppingCart,
  Truck,
  Store,
  Building,
  Package,
  Smartphone,
  ArrowRight,
  Clock,
  Star,
  Quote,
  MessageSquare,
  BarChart3,
  ScanLine,
  Shield
} from 'lucide-vue-next'
import {
  CREDIT_PRICE_DELIVERED,
  CREDIT_PRICE_RETURNED,
  CREDIT_PRICE_DELIVERED_MILLIMES,
  CREDIT_PRICE_RETURNED_MILLIMES,
  FREE_TIER_PACKAGES,
} from '@/data/pricing'

const themeStore = useThemeStore()

// Countdown timer - Launch date: February 26, 2026 (15 days)
const launchDate = new Date('2026-02-26T00:00:00')

const countdown = reactive({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

let countdownInterval: number | null = null

function updateCountdown() {
  const now = new Date().getTime()
  const distance = launchDate.getTime() - now

  if (distance > 0) {
    countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24))
    countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000)
  }
}

onMounted(() => {
  updateCountdown()
  countdownInterval = window.setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

// Pricing calculator
const deliveredCount = ref(500)
const returnedCount = ref(50)

const calculatedPrice = computed(() => {
  const delivered = deliveredCount.value
  const returned = returnedCount.value

  const billableDelivered = Math.max(0, delivered - Math.min(FREE_TIER_PACKAGES, delivered))
  const remainingFree = Math.max(0, FREE_TIER_PACKAGES - delivered)
  const billableReturned = Math.max(0, returned - remainingFree)

  return (billableDelivered * CREDIT_PRICE_DELIVERED) + (billableReturned * CREDIT_PRICE_RETURNED)
})

// Solutions modal
const activeSolution = ref<string | null>(null)
</script>

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

/* Custom slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f97316;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.4);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f97316;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.4);
}
</style>
