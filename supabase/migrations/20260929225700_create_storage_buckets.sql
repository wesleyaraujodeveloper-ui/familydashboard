-- Etapa 10: Criação do Bucket de Storage para Upload de Mídias (Imagens/Anexos)

-- 1. Cria o bucket chamado "family_media" se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family_media', 'family_media', true) -- Usando public = true para facilitar a visualização no App sem precisar gerar links assinados toda hora (os nomes dos arquivos serão UUIDs criptografados).
ON CONFLICT (id) DO NOTHING;

-- 2. Regras de Segurança (RLS) no Storage
-- (Apenas usuários autenticados podem enviar arquivos)
CREATE POLICY "Permitir upload para usuarios logados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family_media');

-- (Qualquer um pode ler se tiver a URL, mas como o bucket é publico o acesso de leitura já é simplificado, garantimos isso na policy por segurança)
CREATE POLICY "Permitir leitura de midias publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'family_media');

-- (Apenas quem enviou a foto pode deletá-la)
CREATE POLICY "Permitir exclusao pelo dono do arquivo"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'family_media' AND owner = auth.uid());
