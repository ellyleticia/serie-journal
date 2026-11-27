import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { todayISO } from '../../utils/date.js';
import { FIELDS, toFormValues, toSerie, validateField, validateForm } from './validation.js';

const FIELD_CONFIG = {
  title: { label: 'Título' },
  seasons: { label: 'Número de Temporadas', type: 'number', inputMode: 'numeric' },
  releaseDate: { label: 'Data de Lançamento da Temporada', type: 'date' },
  director: { label: 'Diretor' },
  production: { label: 'Produtora' },
  category: { label: 'Categoria' },
  watchedAt: { label: 'Data em que assistiu', type: 'date' },
};

/**
 * Formulário de série usado no cadastro e na edição.
 *
 * Props:
 * - initialData: série a editar (ou null/undefined para cadastro);
 * - onSubmit(serie): chamado com os dados válidos. Pode devolver uma Promise;
 *   se ela for rejeitada, a mensagem do erro aparece num Alert no topo do formulário
 *   e o que o usuário digitou é mantido;
 * - onCancel(): chamado pelo botão Cancelar.
 */
function SerieForm({ initialData, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(initialData));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef(null);
  // Trava síncrona contra duplo clique (o estado só atualiza no próximo render).
  const submittingRef = useRef(false);

  // Revalida um campo e, quando a data de lançamento muda, também a data em que assistiu.
  const revalidate = (nextValues, names) => {
    setErrors((current) => {
      const next = { ...current };
      names.forEach((name) => {
        next[name] = validateField(name, nextValues);
      });
      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    const toCheck = [];
    if (touched[name]) toCheck.push(name);
    if (name === 'releaseDate' && touched.watchedAt) toCheck.push('watchedAt');
    if (toCheck.length) revalidate(nextValues, toCheck);
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    revalidate(values, [name]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const validationErrors = validateForm(values);
    setErrors(validationErrors);
    setTouched(Object.fromEntries(FIELDS.map((field) => [field, true])));

    const firstInvalid = FIELDS.find((field) => validationErrors[field]);
    if (firstInvalid) {
      formRef.current?.querySelector(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit(toSerie(values, initialData?.id));
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível salvar a série.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const fieldError = (name) => (touched[name] ? errors[name] : '');

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Box component="form" ref={formRef} onSubmit={handleSubmit} noValidate>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
            {submitError}
          </Alert>
        )}

        <Stack spacing={2.5}>
          {FIELDS.map((name) => {
            const { label, type = 'text', inputMode } = FIELD_CONFIG[name];
            const error = fieldError(name);
            const isDate = type === 'date';
            return (
              <TextField
                key={name}
                id={`serie-${name}`}
                name={name}
                label={label}
                type={type}
                value={values[name]}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                fullWidth
                variant="outlined"
                disabled={submitting}
                error={Boolean(error)}
                helperText={error || ' '}
                slotProps={{
                  inputLabel: isDate ? { shrink: true } : undefined,
                  htmlInput: {
                    ...(type === 'number' && { min: 1, step: 1, inputMode }),
                    ...(name === 'watchedAt' && { max: todayISO() }),
                  },
                }}
              />
            );
          })}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="secondary" loading={submitting}>
            Salvar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default SerieForm;
