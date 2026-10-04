import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';

function toFormValues(profile) {
  return {
    agency: profile?.agency || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    experienceYears: profile?.experienceYears ?? '',
    specialties: profile?.specialties?.join(', ') || '',
    bio: profile?.bio || '',
  };
}

export function AgentProfileForm({ profile, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(profile));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({
        ...values,
        experienceYears: Number(values.experienceYears || 0),
        specialties: values.specialties.split(',').map((item) => item.trim()).filter(Boolean),
      });
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />

      <div className="form-grid">
        <label>
          Agency
          <input name="agency" value={values.agency} onChange={handleChange} required maxLength={80} />
        </label>
        <label>
          Phone
          <input
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            required
            placeholder="+91 98765 43210"
          />
        </label>
        <label>
          City
          <input name="city" value={values.city} onChange={handleChange} required />
        </label>
        <label>
          Years of experience
          <input
            type="number"
            name="experienceYears"
            min="0"
            max="60"
            value={values.experienceYears}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        Specialties <span className="muted small">(comma separated)</span>
        <input
          name="specialties"
          value={values.specialties}
          onChange={handleChange}
          placeholder="Villas, Rentals, First homes"
        />
      </label>

      <label>
        Bio
        <textarea name="bio" rows="3" value={values.bio} onChange={handleChange} maxLength={600} />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : profile ? 'Save profile' : 'Create profile'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
