/**
 * Modelo Usuario
 * Representa a un conductor o pasajero de la plataforma.
 * Aplica encapsulación: los datos sensibles (password_hash) solo se
 * exponen a través de métodos controlados.
 */
class Usuario {
  constructor({
    id, nombre, email, passwordHash, telefono, barrio, tipoUsuario, estado, creadoEn,
  }) {
    this.id = id ?? null;
    this.nombre = nombre;
    this.email = email;
    this._passwordHash = passwordHash;
    this.telefono = telefono;
    this.barrio = barrio;
    this.tipoUsuario = tipoUsuario || 'pasajero';
    this.estado = estado || 'activo';
    this.creadoEn = creadoEn ?? null;

    this.validar();
  }

  /** Reglas de validación básicas del dominio */
  validar() {
    if (!this.nombre || this.nombre.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }
    if (!/^\S+@\S+\.\S+$/.test(this.email || '')) {
      throw new Error('El email no tiene un formato válido');
    }
    if (!this.telefono || !/^\d{7,10}$/.test(this.telefono)) {
      throw new Error('El teléfono debe tener entre 7 y 10 dígitos');
    }
    const tiposValidos = ['conductor', 'pasajero', 'ambos'];
    if (!tiposValidos.includes(this.tipoUsuario)) {
      throw new Error(`Tipo de usuario inválido. Debe ser: ${tiposValidos.join(', ')}`);
    }
  }

  get passwordHash() {
    return this._passwordHash;
  }

  esConductor() {
    return this.tipoUsuario === 'conductor' || this.tipoUsuario === 'ambos';
  }

  /** Representación pública segura, sin exponer el hash de contraseña */
  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      barrio: this.barrio,
      tipoUsuario: this.tipoUsuario,
      estado: this.estado,
      creadoEn: this.creadoEn,
    };
  }
}

module.exports = Usuario;
