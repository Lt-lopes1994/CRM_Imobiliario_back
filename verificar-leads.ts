// Script para verificar os leads criados no banco
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarLeads() {
  console.log('\n📊 VERIFICANDO LEADS NO BANCO DE DADOS\n');
  console.log('='.repeat(60));

  try {
    // Busca o último lead criado
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        triageSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (leads.length === 0) {
      console.log('\n⚠️  Nenhum lead encontrado no banco.\n');
      return;
    }

    console.log(`\n✅ ${leads.length} lead(s) encontrado(s):\n`);

    leads.forEach((lead, index) => {
      console.log(`\n📌 Lead #${index + 1}:`);
      console.log(`   ID: ${lead.id}`);
      console.log(`   Nome: ${lead.name}`);
      console.log(`   Telefone: ${lead.phone}`);
      console.log(`   Email: ${lead.email || 'N/A'}`);
      console.log(`   Tipo de Interesse: ${lead.interestType || 'N/A'}`);
      console.log(
        `   Orçamento: ${lead.budgetMin ? `R$ ${Number(lead.budgetMin).toLocaleString('pt-BR')}` : 'N/A'}`,
      );
      console.log(`   Cidade: ${lead.cityPreference || 'N/A'}`);
      console.log(`   🎯 Pontuação: ${lead.score} pontos`);
      console.log(`   📊 Estágio: ${lead.stage}`);
      console.log(`   📍 Origem: ${lead.source}`);
      console.log(`   📅 Criado: ${lead.createdAt.toLocaleString('pt-BR')}`);

      if (lead.triageSessions.length > 0) {
        const session = lead.triageSessions[0];
        console.log(`\n   💬 Sessão de Triagem:`);
        console.log(`      Canal: ${session.channel}`);
        console.log(`      Chat ID: ${session.externalChatId}`);
        console.log(`      Status: ${session.status}`);
        console.log(`      Qualificação: ${session.qualification}/100`);
        console.log(
          `      Completa: ${session.completedAt ? 'Sim' : 'Em andamento'}`,
        );

        if (session.answers) {
          console.log(`      Respostas: ${JSON.stringify(session.answers)}`);
        }
      }

      console.log('\n' + '-'.repeat(60));
    });

    // Estatísticas
    const totalLeads = await prisma.lead.count();
    const qualified = await prisma.lead.count({
      where: { stage: 'QUALIFIED' },
    });
    const contacted = await prisma.lead.count({
      where: { stage: 'CONTACTED' },
    });

    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de Leads: ${totalLeads}`);
    console.log(`   Qualificados: ${qualified}`);
    console.log(`   Contatados: ${contacted}`);
    console.log(
      `   Taxa de Qualificação: ${((qualified / totalLeads) * 100).toFixed(1)}%`,
    );
    console.log('\n' + '='.repeat(60) + '\n');
  } catch (erro: unknown) {
    const errorMessage = erro instanceof Error ? erro.message : 'Unknown error';
    console.error('\n❌ Erro ao buscar leads:', errorMessage);
  } finally {
    await prisma.$disconnect();
  }
}

void verificarLeads();
