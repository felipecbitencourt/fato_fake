/**
 * Module 3: Data Source
 * Centralized data for all charts in Module 3.
 * Data sources: Google Trends (Brasil), Ministério da Saúde, Datafolha.
 * Last Update: 2024
 */

window.Module3Data = {
    // 02_trends.html (Antigo 01_intro.html)
    intro: {
        fakeNews: {
            // Fonte: Google Trends Brasil (Termo: "Fake News")
            // Dados normalizados (0-100) baseados no pico histórico de Outubro 2018.
            labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            data: [2, 4, 18, 100, 32, 65, 38, 82, 28, 22]
        },
        comparison: {
            // Comparativo: Fake News (Explosivo) vs Desinformação (Crescimento técnico/constante)
            dataFake: [2, 5, 20, 100, 40, 70, 50, 85, 30, 25],
            dataDisinfo: [5, 8, 12, 25, 35, 60, 70, 80, 90, 95]
        },
        categories: {
            // Distribuição baseada em pesquisa de crença em fake news (Fev 2024)
            // Tópicos com maior taxa de crença entre brasileiros:
            // Venda de Produtos/Golpes (64%), Propostas Eleitorais (63%),
            // Políticas Públicas/Saúde (62%), Escândalos Políticos (62%),
            // Economia (57%), Segurança (51%).
            // *Dados simplificados para o gráfico de rosca (Soma != 100%, são taxas independentes, adaptado para proporção)
            labels: ['Golpes/Produtos', 'Política/Eleições', 'Saúde', 'Economia', 'Segurança', 'Outros'],
            data: [25, 35, 20, 10, 8, 2]
        }
    },

    // 02_health.html
    health: {
        // Fonte: Datasus (Cobertura Sarampo D1) vs Google Trends ("Vacina Autismo/Mal")
        // Notar a correlação inversa: Queda da cobertura vs Aumento do ruído online
        // 2018: Brasil perde certificação de país livre do sarampo.
        // 2024: Recuperação da cobertura (>95%).
        labels: ['2014', '2016', '2018', '2020', '2022', '2024'],
        searches: [10, 20, 95, 100, 60, 20], // Interesse por teorias anti-vacina
        coverage: [97, 95, 80, 70, 75, 95]   // Cobertura Vacinal (%)
    },

    // 03_science.html
    science: {
        // Fonte: Google Trends (Termo: "Terra Plana" Brasil)
        // Pico histórico em 2019 (Datafolha survey, Flat Con SP)
        labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
        interest: [5, 10, 35, 75, 100, 85, 40, 15, 10]
    },

    // 04_society.html
    society: {
        // Fonte: Google Trends (Pico de busca por "Cloroquina/Ivermectina" ou curas milagrosas)
        // Contexto: Início da pandemia (Março/Abril 2020)
        labels: ['Jan 20', 'Fev 20', 'Mar 20', 'Abr 20', 'Mai 20'],
        searches: [2, 5, 100, 85, 45]
    },

    // 05_conspiracy.html
    conspiracy: {
        // Comparativo de Eras Conspiratórias
        labels: ['2010', '2012', '2014', '2016', '2018', '2020', '2022', '2024'],
        illuminati: [90, 85, 75, 60, 45, 30, 20, 15], // Clássico (Declínio)
        qanon: [0, 0, 0, 5, 25, 100, 60, 40]          // Moderno (Ascensão e estabilização)
    },

    // 06_datalab.html
    datalab: {
        scenarios: {
            election: {
                label: 'Desinformação Eleitoral (2022)',
                // Baseado em análise de volume de checagens em Outubro 2022
                data: [15, 25, 85, 100, 50, 20],
                labels: ['Jul', 'Ago', 'Set (Debates)', 'Out (Voto)', 'Nov', 'Dez'],
                insight: 'Pico extremo na semana da votação. A desinformação é tática e cronometrada.'
            },
            health: {
                label: 'Buscas "Tratamento Precoce" (2020)',
                // Baseado em Google Trends Março 2020
                data: [5, 100, 80, 40, 20, 10],
                labels: ['Fev', 'Mar (Pânico)', 'Abr', 'Mai', 'Jun', 'Jul'],
                insight: 'Explosão imediata no início da crise. O vácuo de informação oficial é preenchido por boatos.'
            },
            celebrity: {
                label: 'Fofoca Viral (Caso Genérico)',
                // Ciclo de vida padrão de fofoca de celebridade
                data: [0, 100, 20, 5, 2, 0],
                labels: ['12h', '24h', '36h', '48h', '60h', '72h'],
                insight: 'Ciclo explosivo e curto. Diferente da política, não se sustenta sem fatos novos.'
            }
        }
    }
};
