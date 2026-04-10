<template>
  <div class="bg-gray-950/90 text-gray-100 rounded-lg p-6 space-y-8">
    <!-- Welcome -->
    <div>
      <h1 class="text-3xl font-bold text-yellow-400 mb-2">Bem-vindo ao Albion Online Metrics</h1>
      <p class="text-gray-300 leading-relaxed">
        O Albion Online Metrics é uma ferramenta de análise de mercado para
        <span class="text-yellow-300 font-medium">Albion Online</span>. Aqui você encontra
        calculadoras para refino, produção na ilha particular e análise de preços em tempo real -
        tudo em um só lugar.
      </p>
    </div>

    <!-- Features -->
    <div>
      <h2 class="text-lg font-semibold text-gray-400 uppercase tracking-wider mb-4">
        O que você pode fazer
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <!-- Mercado -->
        <RouterLink
          to="/market"
          class="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-yellow-400/40 rounded-xl p-5 transition-all"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">📊</span>
            <span class="font-semibold text-yellow-300 group-hover:text-yellow-200">Mercado</span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Consulte preços de venda mínimos e máximos de qualquer item em todas as cidades. Filtre
            por qualidade, localidade e analise a atualidade dos dados com indicadores de cor.
          </p>
        </RouterLink>

        <!-- Flip -->
        <RouterLink
          to="/flip-market"
          class="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-yellow-400/40 rounded-xl p-5 transition-all"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🔄</span>
            <span class="font-semibold text-yellow-300 group-hover:text-yellow-200">Flip</span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Identifique oportunidades de lucro comprando itens em Caerleon e vendendo no Black
            Market. Veja o lucro absoluto e percentual para todos os itens equipáveis de uma vez.
          </p>
        </RouterLink>

        <!-- Refino -->
        <RouterLink
          to="/refine"
          class="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-yellow-400/40 rounded-xl p-5 transition-all"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">⚗️</span>
            <span class="font-semibold text-yellow-300 group-hover:text-yellow-200">Refino</span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Calcule a lucratividade do refino de recursos brutos (couro, madeira, minério, fibra)
            considerando os preços atuais dos materiais e do produto refinado.
          </p>
        </RouterLink>

        <!-- Fazendas -->
        <RouterLink
          to="/island-farm"
          class="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-yellow-400/40 rounded-xl p-5 transition-all"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🌾</span>
            <span class="font-semibold text-yellow-300 group-hover:text-yellow-200"
              >Ilha · Fazendas</span
            >
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Estime o rendimento das plantações na ilha particular. Configure os plots disponíveis e
            veja quais culturas oferecem melhor retorno por ciclo.
          </p>
        </RouterLink>

        <!-- Hortas -->
        <RouterLink
          to="/island-herb-garden"
          class="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-yellow-400/40 rounded-xl p-5 transition-all"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🌿</span>
            <span class="font-semibold text-yellow-300 group-hover:text-yellow-200"
              >Ilha · Hortas</span
            >
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Calcule o retorno das ervas cultivadas na horta da ilha. Compare diferentes plantas e
            identifique as mais lucrativas com base nos preços de mercado.
          </p>
        </RouterLink>

        <!-- Pastos -->
        <RouterLink
          to="/island-pasture"
          class="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-yellow-400/40 rounded-xl p-5 transition-all"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🐄</span>
            <span class="font-semibold text-yellow-300 group-hover:text-yellow-200"
              >Ilha · Pastos</span
            >
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Analise a produtividade dos animais nos pastos da ilha. Veja qual criação gera mais
            recursos e lucro considerando os preços atuais de mercado.
          </p>
        </RouterLink>
      </div>
    </div>

    <!-- Data source -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 class="text-lg font-semibold text-gray-400 uppercase tracking-wider mb-4">
        De onde vêm os dados?
      </h2>
      <p class="text-gray-300 leading-relaxed mb-4">
        Todos os preços exibidos neste site são alimentados pela API do
        <span class="text-yellow-300 font-medium">Albion Online Data Project</span> — um projeto
        comunitário e gratuito que coleta dados de mercado em tempo real diretamente dos jogadores.
        Os dados são atualizados à medida que os jogadores navegam pelo mercado com o client
        instalado.
      </p>
      <div class="bg-gray-800 rounded-lg p-4 text-sm text-gray-400 leading-relaxed mb-4">
        <span class="text-yellow-400 font-semibold">Importante:</span> o client só consegue enviar
        os preços das ordens de mercado que
        <span class="text-gray-200">você mesmo abre no jogo</span>. Quanto mais jogadores navegarem
        pelo mercado com o client ativo, mais completos e atualizados serão os dados.
      </div>

      <!-- Install steps -->
      <h3 class="text-base font-semibold text-gray-300 mb-3">Como instalar o client</h3>
      <ol class="space-y-3 mb-6">
        <li class="flex gap-3 text-sm text-gray-300">
          <span
            class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-gray-950 font-bold text-xs flex items-center justify-center"
            >1</span
          >
          <span
            >Acesse o site do Albion Online Data Project pelo botão abaixo e vá até a seção
            <span class="text-yellow-300 font-medium">Client</span>.</span
          >
        </li>
        <li class="flex gap-3 text-sm text-gray-300">
          <span
            class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-gray-950 font-bold text-xs flex items-center justify-center"
            >2</span
          >
          <span
            >Clique em <span class="text-yellow-300 font-medium">Download the client</span> — você
            será redirecionado para a página de releases no GitHub. Baixe o instalador para o seu
            sistema operacional (<span class="text-gray-200">Windows</span>,
            <span class="text-gray-200">macOS</span> ou
            <span class="text-gray-200">Linux</span>).</span
          >
        </li>
        <li class="flex gap-3 text-sm text-gray-300">
          <span
            class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-gray-950 font-bold text-xs flex items-center justify-center"
            >3</span
          >
          <span
            >Instale e execute o client <span class="text-gray-200">antes ou durante</span> sua
            sessão de jogo. Ele roda em segundo plano e não interfere no jogo.</span
          >
        </li>
        <li class="flex gap-3 text-sm text-gray-300">
          <span
            class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-gray-950 font-bold text-xs flex items-center justify-center"
            >4</span
          >
          <span
            >Abra o mercado dentro do jogo. O client detecta automaticamente os preços e os envia
            para o servidor. Os dados ficam visíveis na API imediatamente.</span
          >
        </li>
      </ol>

      <div class="flex flex-wrap gap-3">
        <a
          href="https://www.albion-online-data.com/client"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-semibold text-sm transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Baixar o Client
        </a>
        <a
          href="https://www.albion-online-data.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm transition-colors border border-gray-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Site do Projeto
        </a>
      </div>
    </div>
  </div>
</template>
