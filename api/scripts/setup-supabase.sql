-- Recrie a tabela de usuários com todas as colunas necessárias
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('personal', 'aluno')),
  codigo_personal TEXT,
  personal_id UUID REFERENCES usuarios(id),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Índice para busca por código de personal
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo_personal ON usuarios(codigo_personal);

-- Índice para busca de alunos por personal
CREATE INDEX IF NOT EXISTS idx_usuarios_personal_id ON usuarios(personal_id);

-- Criar tabela de treinos
CREATE TABLE IF NOT EXISTS treinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  dia_semana TEXT NOT NULL CHECK (dia_semana IN (
    'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 
    'sexta-feira', 'sabado', 'domingo'
  )),
  personal_id UUID NOT NULL REFERENCES usuarios(id),
  aluno_id UUID REFERENCES usuarios(id),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca de treinos
CREATE INDEX IF NOT EXISTS idx_treinos_personal_id ON treinos(personal_id);
CREATE INDEX IF NOT EXISTS idx_treinos_aluno_id ON treinos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_treinos_dia_semana ON treinos(dia_semana);

-- Criar tabela de exercícios
CREATE TABLE IF NOT EXISTS exercicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treino_id UUID NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  series INTEGER NOT NULL,
  repeticoes INTEGER NOT NULL,
  observacoes TEXT,
  concluido BOOLEAN DEFAULT FALSE,
  ordem INTEGER NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca de exercícios por treino
CREATE INDEX IF NOT EXISTS idx_exercicios_treino_id ON exercicios(treino_id);

-- Políticas de segurança (Row Level Security)
-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;

-- Criar políticas (a serem implementadas conforme necessidade)
-- Exemplo:
-- CREATE POLICY "Usuários podem visualizar seus próprios dados" ON usuarios 
--   FOR SELECT USING (auth.uid() = id);

-- Gatilhos para atualizar data_atualizacao
CREATE OR REPLACE FUNCTION update_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_data_atualizacao
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();

CREATE TRIGGER update_treinos_data_atualizacao
BEFORE UPDATE ON treinos
FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();

CREATE TRIGGER update_exercicios_data_atualizacao
BEFORE UPDATE ON exercicios
FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();

-- Desativar temporariamente RLS para testes
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- OU criar uma política que permita inserções
CREATE POLICY "Permitir inserções públicas" ON usuarios 
  FOR INSERT
  WITH CHECK (true);

-- Certificar-se de que as outras tabelas também estão configuradas corretamente
DROP TABLE IF EXISTS treinos CASCADE;
DROP TABLE IF EXISTS exercicios CASCADE;

-- E recriar usando o script completo de setup-supabase.sql 