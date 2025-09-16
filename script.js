document.addEventListener('DOMContentLoaded', () => {



            // --- INSTANCIAS DE MODALES DE BOOTSTRAP ---
            const pacienteModal = new bootstrap.Modal(document.getElementById('pacienteModal'));
            const citaModal = new bootstrap.Modal(document.getElementById('citaModal'));
            const historialModal = new bootstrap.Modal(document.getElementById('historialModal'));
            const servicioModal = new bootstrap.Modal(document.getElementById('servicioModal'));
            const oficinaModal = new bootstrap.Modal(document.getElementById('oficinaModal'));
            const usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));

            // --- VARIABLES GLOBALES ---
            let loggedInUser = null;
            let currentYear = new Date().getFullYear();
            let currentMonth = new Date().getMonth();
            let charts = {};

            // --- MANEJO DE DATOS (LocalStorage) ---
            const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
            const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

            function initData() {


                // Si no hay datos, crea datos de ejemplo
                if (!localStorage.getItem('users')) {
                    const sampleUsers = [{
                        id: 1,
                        nombre: 'Dr. Alan García',
                        username: 'agarcia',
                        password: '123',
                        rol: 'doctor',
                        especialidad: 'Cardiología'
                    }, {
                        id: 2,
                        nombre: 'Lic. Maria Ríos',
                        username: 'mrios',
                        password: '123',
                        rol: 'recepcionista',
                        especialidad: ''
                    }, {
                        id: 3,
                        nombre: 'Admin General',
                        username: 'admin',
                        password: 'admin',
                        rol: 'admin',
                        especialidad: ''
                    }, {
                        id: 4,
                        nombre: 'Dra. Ana Torres',
                        username: 'atorres',
                        password: '123',
                        rol: 'doctor',
                        especialidad: 'Pediatría'
                    }, ];
                    saveToStorage('users', sampleUsers);
                }
                // Repetir para los demás datos... (pacientes, servicios, etc.)
                if (!localStorage.getItem('pacientes')) {
                    const samplePacientes = [{
                        id: 1,
                        dni: '12345678',
                        nombre: 'Carlos',
                        apellidos: 'Vargas Llosa',
                        fechaNacimiento: '1985-05-20',
                        genero: 'Masculino',
                        telefono: '987654321',
                        correo: 'carlos.v@example.com',
                        direccion: 'Av. El Sol 123'
                    }, {
                        id: 2,
                        dni: '87654321',
                        nombre: 'Juana',
                        apellidos: 'Mendoza Paz',
                        fechaNacimiento: '1992-11-15',
                        genero: 'Femenino',
                        telefono: '912345678',
                        correo: 'juana.m@example.com',
                        direccion: 'Jr. Lima 456'
                    }, ];
                    saveToStorage('pacientes', samplePacientes);
                }
                if (!localStorage.getItem('servicios')) {
                    saveToStorage('servicios', [{
                        id: 1,
                        nombre: 'Consulta General',
                        precio: 50.00
                    }, {
                        id: 2,
                        nombre: 'Cardiología',
                        precio: 80.00
                    }, {
                        id: 3,
                        nombre: 'Pediatría',
                        precio: 60.00
                    }]);
                }
                if (!localStorage.getItem('oficinas')) {
                    saveToStorage('oficinas', [{
                        id: 1,
                        nombre: 'Consultorio 101'
                    }, {
                        id: 2,
                        nombre: 'Consultorio 102'
                    }, {
                        id: 3,
                        nombre: 'Tópico'
                    }]);
                }
                if (!localStorage.getItem('citas')) {
                    const today = new Date();
                    const tomorrow = new Date();
                    tomorrow.setDate(today.getDate() + 1);
                    saveToStorage('citas', [{
                        id: 1,
                        pacienteId: 1,
                        servicioId: 2,
                        medicoId: 1,
                        oficinaId: 1,
                        fecha: today.toISOString().split('T')[0],
                        hora: '10:00',
                        estado: 'Confirmada'
                    }, {
                        id: 2,
                        pacienteId: 2,
                        servicioId: 3,
                        medicoId: 4,
                        oficinaId: 2,
                        fecha: tomorrow.toISOString().split('T')[0],
                        hora: '11:30',
                        estado: 'Pendiente'
                    }, ]);
                }
                if (!localStorage.getItem('historial')) {
                    saveToStorage('historial', [{
                        id: 1,
                        pacienteId: 1,
                        medicoId: 1,
                        fecha: '2023-10-15',
                        motivo: 'Chequeo anual',
                        diagnostico: 'Hipertensión Leve',
                        tratamiento: 'Dieta baja en sodio y ejercicio regular.',
                        notas: 'Paciente refiere estrés laboral.'
                    }]);
                }
            }
            // ==================
            // CITAS - EVENT LISTENERS
            // ==================
            document.getElementById('btnAgendarCita').addEventListener('click', () => {
                document.getElementById('citaForm').reset();
                document.getElementById('citaId').value = '';
                document.getElementById('citaModalLabel').textContent = 'Agendar Nueva Cita';
                document.getElementById('citaFecha').value = new Date().toISOString().split('T')[0];
                populateCitaForm();
                citaModal.show();
            });

            document.getElementById('citaForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('citaId').value;
                const citaData = {
                    pacienteId: parseInt(document.getElementById('citaPaciente').value),
                    servicioId: parseInt(document.getElementById('citaServicio').value),
                    medicoId: parseInt(document.getElementById('citaMedico').value),
                    oficinaId: parseInt(document.getElementById('citaOficina').value),
                    fecha: document.getElementById('citaFecha').value,
                    hora: document.getElementById('citaHora').value,
                    estado: document.getElementById('citaEstado').value
                };

                let citas = getFromStorage('citas');
                if (id) {
                    // Editar cita existente
                    const index = citas.findIndex(c => c.id == id);
                    citas[index] = {...citas[index], ...citaData };
                } else {
                    // Crear nueva cita
                    citaData.id = Date.now();
                    citas.push(citaData);
                }

                saveToStorage('citas', citas);
                renderCalendar(currentYear, currentMonth);
                citaModal.hide();
                showToast(`Cita ${id ? 'actualizada' : 'agendada'} correctamente.`);
            });

            document.getElementById('prevMonthBtn').addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderCalendar(currentYear, currentMonth);
            });

            document.getElementById('nextMonthBtn').addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderCalendar(currentYear, currentMonth);
            });

            document.getElementById('calendar-grid-body').addEventListener('click', (e) => {
                if (e.target.classList.contains('calendar-appointment')) {
                    const citaId = parseInt(e.target.dataset.id);
                    const citas = getFromStorage('citas');
                    const cita = citas.find(c => c.id === citaId);

                    if (cita) {
                        document.getElementById('citaId').value = cita.id;
                        document.getElementById('citaModalLabel').textContent = 'Editar Cita';

                        populateSelect('citaPaciente', getFromStorage('pacientes').map(p => ({
                            value: p.id,
                            text: `${p.nombre} ${p.apellidos} (${p.dni})`
                        })), cita.pacienteId);

                        populateSelect('citaServicio', getFromStorage('servicios').map(s => ({
                            value: s.id,
                            text: `${s.nombre} (S/${s.precio})`
                        })), cita.servicioId);

                        populateSelect('citaMedico', getFromStorage('users')
                            .filter(u => u.rol === 'doctor')
                            .map(m => ({ value: m.id, text: m.nombre })), cita.medicoId);

                        populateSelect('citaOficina', getFromStorage('oficinas').map(o => ({
                            value: o.id,
                            text: o.nombre
                        })), cita.oficinaId);

                        document.getElementById('citaFecha').value = cita.fecha;
                        document.getElementById('citaHora').value = cita.hora;
                        document.getElementById('citaEstado').value = cita.estado;

                        citaModal.show();
                    }
                }
            });

            // Inicializar calendario al cargar
            renderCalendar(currentYear, currentMonth);

            // ==================
            // CITAS - FUNCIONES ADICIONALES
            // ==================
            function renderCalendar(year, month) {
                const calendarTitle = document.getElementById('calendarTitle');
                const calendarGrid = document.getElementById('calendar-grid-body');

                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];

                calendarTitle.textContent = `${monthNames[month]} ${year}`;

                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();

                let calendarHTML = '';
                let dayCount = 1;
                let prevMonthDay = daysInPrevMonth - firstDay + 1;

                // Llenar el calendario
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 7; j++) {
                        if (i === 0 && j < firstDay) {
                            // Días del mes anterior
                            calendarHTML += `<div class="calendar-day other-month">${prevMonthDay++}</div>`;
                        } else if (dayCount > daysInMonth) {
                            // Días del mes siguiente
                            calendarHTML += `<div class="calendar-day other-month">${dayCount - daysInMonth}</div>`;
                            dayCount++;
                        } else {
                            // Días del mes actual
                            const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                            const citasDelDia = getCitasPorFecha(currentDate);

                            calendarHTML += `<div class="calendar-day" data-date="${currentDate}">
                    <div class="calendar-day-header">${dayCount}</div>`;

                            citasDelDia.forEach(cita => {
                                calendarHTML += `<div class="calendar-appointment" data-id="${cita.id}">
                        ${cita.hora} - ${getPacienteNombre(cita.pacienteId)}
                    </div>`;
                            });

                            calendarHTML += `</div>`;
                            dayCount++;
                        }
                    }
                }

                calendarGrid.innerHTML = calendarHTML;
            }

            function getCitasPorFecha(fecha) {
                const citas = getFromStorage('citas');
                return citas.filter(cita => cita.fecha === fecha);
            }

            function getPacienteNombre(pacienteId) {
                const pacientes = getFromStorage('pacientes');
                const paciente = pacientes.find(p => p.id === pacienteId);
                return paciente ? `${paciente.nombre} ${paciente.apellidos}` : 'Paciente';
            }

            function getMedicoNombre(medicoId) {
                const usuarios = getFromStorage('users');
                const medico = usuarios.find(u => u.id === medicoId && u.rol === 'doctor');
                return medico ? medico.nombre : 'Médico';
            }

            function getServicioNombre(servicioId) {
                const servicios = getFromStorage('servicios');
                const servicio = servicios.find(s => s.id === servicioId);
                return servicio ? servicio.nombre : 'Servicio';
            }

            function getOficinaNombre(oficinaId) {
                const oficinas = getFromStorage('oficinas');
                const oficina = oficinas.find(o => o.id === oficinaId);
                return oficina ? oficina.nombre : 'Oficina';
            }

            function populateCitaForm() {
                // Llenar selects del formulario de cita
                populateSelect('citaPaciente', getFromStorage('pacientes').map(p => ({
                    value: p.id,
                    text: `${p.nombre} ${p.apellidos} (${p.dni})`
                })));

                populateSelect('citaServicio', getFromStorage('servicios').map(s => ({
                    value: s.id,
                    text: `${s.nombre} (S/${s.precio})`
                })));

                populateSelect('citaMedico', getFromStorage('users')
                    .filter(u => u.rol === 'doctor')
                    .map(m => ({ value: m.id, text: m.nombre })));

                populateSelect('citaOficina', getFromStorage('oficinas').map(o => ({
                    value: o.id,
                    text: o.nombre
                })));
            }

            // ==================
            // DASHBOARD - FUNCIONES
            // ==================
            function updateDashboard() {
                const pacientes = getFromStorage('pacientes');
                const citas = getFromStorage('citas');
                const historial = getFromStorage('historial');
                const servicios = getFromStorage('servicios');

                // Actualizar estadísticas
                document.getElementById('stat-pacientes').textContent = pacientes.length;

                const hoy = new Date().toISOString().split('T')[0];
                const citasHoy = citas.filter(c => c.fecha === hoy).length;
                document.getElementById('stat-citas').textContent = citasHoy;

                const mesActual = new Date().getMonth();
                const añoActual = new Date().getFullYear();
                const consultasMes = historial.filter(h => {
                    const fecha = new Date(h.fecha);
                    return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
                }).length;
                document.getElementById('stat-consultas').textContent = consultasMes;

                // Calcular ingresos del mes
                let ingresos = 0;
                historial.forEach(consulta => {
                    const fecha = new Date(consulta.fecha);
                    if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
                        // Asumimos que cada consulta tiene un servicio asociado con precio
                        const servicio = servicios.find(s => s.nombre.toLowerCase().includes('consulta'));
                        if (servicio) {
                            ingresos += servicio.precio;
                        }
                    }
                });
                document.getElementById('stat-ingresos').textContent = `S/${ingresos.toFixed(2)}`;

                // Renderizar gráficos
                renderDashboardCharts();
            }

            function renderDashboardCharts() {
                // Implementar gráficos del dashboard
                // Esta es una implementación básica, puedes mejorarla
                const consultasChartCtx = document.getElementById('consultasChart');
                const citasChartCtx = document.getElementById('citasChart');

                if (consultasChartCtx) {
                    charts.consultas = new Chart(consultasChartCtx, {
                        type: 'line',
                        data: {
                            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                            datasets: [{
                                label: 'Consultas por Mes',
                                data: [12, 19, 8, 15, 12, 17],
                                borderColor: 'rgb(13, 110, 253)',
                                tension: 0.1
                            }]
                        }
                    });
                }

                if (citasChartCtx) {
                    charts.citas = new Chart(citasChartCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Pendientes', 'Confirmadas', 'Atendidas', 'Canceladas'],
                            datasets: [{
                                data: [5, 12, 8, 2],
                                backgroundColor: [
                                    'rgb(255, 205, 86)',
                                    'rgb(54, 162, 235)',
                                    'rgb(75, 192, 192)',
                                    'rgb(255, 99, 132)'
                                ]
                            }]
                        }
                    });
                }
            }
            // --- LÓGICA DE LOGIN Y NAVEGACIÓN ---

            document.getElementById('loginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const users = getFromStorage('users');
                const user = users.find(u => u.username === username && u.password === password);

                if (user) {
                    loggedInUser = user;
                    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                    showMainApp();
                } else {
                    document.getElementById('login-error').textContent = 'Usuario o contraseña incorrectos.';
                    document.getElementById('login-error').style.display = 'block';
                }
            });

            function showMainApp() {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').style.display = 'flex';
                document.getElementById('userName').textContent = loggedInUser.nombre;

                // Control de acceso basado en roles
                const navLinks = document.querySelectorAll('.sidebar .nav-item');
                navLinks.forEach(link => {
                    const roles = link.dataset.role;
                    if (roles && !roles.split(',').includes(loggedInUser.rol)) {
                        link.style.display = 'none';
                    } else {
                        link.style.display = 'list-item';
                    }
                });

                navigateTo('dashboard');
            }

            document.querySelector('.sidebar').addEventListener('click', (e) => {
                if (e.target.closest('a.nav-link')) {
                    e.preventDefault();
                    const page = e.target.closest('a.nav-link').dataset.page;
                    navigateTo(page);
                }
            });

            function navigateTo(pageId) {
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                document.getElementById(pageId).classList.add('active');

                document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
                document.querySelector(`.sidebar .nav-link[data-page="${pageId}"]`).classList.add('active');

                // Cargar datos o renderizar vistas según la página
                if (pageId === 'dashboard') updateDashboard();
                if (pageId === 'pacientes') renderPacientesTable();
                if (pageId === 'citas') renderCalendar(currentYear, currentMonth);
                if (pageId === 'historial') renderHistorialTable();
                if (pageId === 'servicios') {
                    renderServiciosTable();
                    renderOficinasTable();
                }
                if (pageId === 'usuarios') renderUsuariosTable();
                if (pageId === 'reportes') updateReports();
            }

            document.getElementById('logout-btn').addEventListener('click', () => {
                loggedInUser = null;
                sessionStorage.removeItem('loggedInUser');
                document.getElementById('main-app').style.display = 'none';
                document.getElementById('login-page').style.display = 'flex';
            });

            // --- FUNCIONALIDAD MODO OSCURO ---
            const darkModeToggle = document.getElementById('darkModeToggle');
            const body = document.body;
            if (localStorage.getItem('darkMode') === 'enabled') {
                body.classList.add('dark-mode');
            }
            darkModeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                body.classList.toggle('dark-mode');
                if (body.classList.contains('dark-mode')) {
                    localStorage.setItem('darkMode', 'enabled');
                } else {
                    localStorage.removeItem('darkMode');
                }
                // Si los gráficos ya se han renderizado, actualízalos para que coincidan con el tema
                Object.values(charts).forEach(chart => chart.destroy());
                if (document.getElementById('dashboard').classList.contains('active')) updateDashboard();
                if (document.getElementById('reportes').classList.contains('active')) updateReports();
            });

            // --- UTILIDADES ---
            const showToast = (message, type = 'success') => {
                const toastContainer = document.querySelector('.toast-container');
                const toastId = `toast-${Date.now()}`;
                const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`;
                toastContainer.insertAdjacentHTML('beforeend', toastHTML);
                const toastElement = document.getElementById(toastId);
                const toast = new bootstrap.Toast(toastElement, {
                    delay: 3000
                });
                toast.show();
                toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
            };
            const calculateAge = (birthdate) => {
                if (!birthdate) return '';
                const ageDifMs = Date.now() - new Date(birthdate).getTime();
                const ageDate = new Date(ageDifMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            };

            // --- LÓGICA DE CADA MÓDULO (CRUD + ACCIONES) ---

            // ==================
            // PACIENTES
            // ==================
            const renderPacientesTable = () => {
                const tbody = document.getElementById('pacientes-table-body');
                const pacientes = getFromStorage('pacientes');
                tbody.innerHTML = pacientes.map(p => `
            <tr>
                <td>${p.dni}</td>
                <td>${p.nombre} ${p.apellidos}</td>
                <td>${calculateAge(p.fechaNacimiento)}</td>
                <td>${p.genero}</td>
                <td>${p.telefono}</td>
                <td>-</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary action-btn btn-view" data-id="${p.id}" title="Ver Perfil"><i class="bi bi-eye-fill"></i></button>
                    <button class="btn btn-sm btn-outline-warning action-btn btn-edit" data-id="${p.id}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger action-btn btn-delete" data-id="${p.id}" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `).join('');
            };

            document.getElementById('btnNuevoPaciente').addEventListener('click', () => {
                document.getElementById('pacienteForm').reset();
                document.getElementById('pacienteId').value = '';
                document.getElementById('pacienteModalLabel').textContent = 'Nuevo Paciente';
                pacienteModal.show();
            });

            document.getElementById('pacienteForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('pacienteId').value;
                const pacienteData = {
                    dni: document.getElementById('pacienteDNI').value,
                    nombre: document.getElementById('pacienteNombre').value,
                    apellidos: document.getElementById('pacienteApellidos').value,
                    fechaNacimiento: document.getElementById('pacienteNacimiento').value,
                    genero: document.getElementById('pacienteGenero').value,
                    telefono: document.getElementById('pacienteTelefono').value,
                    correo: document.getElementById('pacienteCorreo').value,
                    direccion: document.getElementById('pacienteDireccion').value,
                };

                let pacientes = getFromStorage('pacientes');
                if (id) { // Editando
                    const index = pacientes.findIndex(p => p.id == id);
                    pacientes[index] = {...pacientes[index],
                        ...pacienteData
                    };
                } else { // Creando
                    pacienteData.id = Date.now();
                    pacientes.push(pacienteData);
                }
                saveToStorage('pacientes', pacientes);
                renderPacientesTable();
                pacienteModal.hide();
                showToast(`Paciente ${id ? 'actualizado' : 'guardado'} correctamente.`);
            });

            document.getElementById('pacientes-table-body').addEventListener('click', (e) => {
                const button = e.target.closest('button.action-btn');
                if (!button) return;
                const id = parseInt(button.dataset.id);

                if (button.classList.contains('btn-view')) {
                    showPatientProfile(id); // Función para mostrar el perfil
                }
                if (button.classList.contains('btn-edit')) {
                    const pacientes = getFromStorage('pacientes');
                    const paciente = pacientes.find(p => p.id === id);
                    document.getElementById('pacienteId').value = paciente.id;
                    document.getElementById('pacienteModalLabel').textContent = 'Editar Paciente';
                    document.getElementById('pacienteDNI').value = paciente.dni;
                    document.getElementById('pacienteNombre').value = paciente.nombre;
                    document.getElementById('pacienteApellidos').value = paciente.apellidos;
                    document.getElementById('pacienteNacimiento').value = paciente.fechaNacimiento;
                    document.getElementById('pacienteGenero').value = paciente.genero;
                    document.getElementById('pacienteTelefono').value = paciente.telefono;
                    document.getElementById('pacienteCorreo').value = paciente.correo;
                    document.getElementById('pacienteDireccion').value = paciente.direccion;
                    pacienteModal.show();
                }
                if (button.classList.contains('btn-delete')) {
                    if (confirm('¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.')) {
                        let pacientes = getFromStorage('pacientes');
                        pacientes = pacientes.filter(p => p.id !== id);
                        saveToStorage('pacientes', pacientes);
                        renderPacientesTable();
                        showToast('Paciente eliminado correctamente.', 'danger');
                    }
                }
            });

            function showPatientProfile(patientId) {
                // Esta es una función de ejemplo, puedes expandirla mucho más
                const pacientes = getFromStorage('pacientes');
                const paciente = pacientes.find(p => p.id === patientId);
                if (!paciente) return;

                document.getElementById('pacientes-table-view').style.display = 'none';
                const profileView = document.getElementById('paciente-profile-view');

                profileView.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h1 class="h2">Perfil del Paciente</h1>
                <button id="backToPatientsList" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-2"></i>Volver a la lista</button>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3 text-center">
                             <img src="https://i.pravatar.cc/150?u=${paciente.dni}" class="img-fluid rounded-circle mb-3" alt="Foto de perfil">
                             <h4>${paciente.nombre} ${paciente.apellidos}</h4>
                             <p class="text-muted">${calculateAge(paciente.fechaNacimiento)} años</p>
                        </div>
                        <div class="col-md-9">
                            <h5>Información de Contacto</h5>
                            <hr>
                            <p><strong>DNI:</strong> ${paciente.dni}</p>
                            <p><strong>Teléfono:</strong> ${paciente.telefono}</p>
                            <p><strong>Correo Electrónico:</strong> ${paciente.correo}</p>
                            <p><strong>Dirección:</strong> ${paciente.direccion}</p>
                             <button class="btn btn-sm btn-warning action-btn btn-edit" data-id="${paciente.id}" title="Editar Paciente"><i class="bi bi-pencil-square"></i> Editar Información</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
                profileView.style.display = 'block';

                document.getElementById('backToPatientsList').addEventListener('click', () => {
                    profileView.style.display = 'none';
                    document.getElementById('pacientes-table-view').style.display = 'block';
                });
            }

            // ==================
            // HISTORIAL CLÍNICO
            // ==================
            const renderHistorialTable = () => {
                    const tbody = document.getElementById('historial-table-body');
                    const historial = getFromStorage('historial');
                    const pacientes = getFromStorage('pacientes');
                    const medicos = getFromStorage('users').filter(u => u.rol === 'doctor');

                    tbody.innerHTML = historial.map(h => {
                                const paciente = pacientes.find(p => p.id === h.pacienteId);
                                const medico = medicos.find(m => m.id === h.medicoId);
                                return `
                <tr>
                    <td>${h.fecha}</td>
                    <td>${paciente ? `${paciente.nombre} ${paciente.apellidos}` : 'N/A'}</td>
                    <td>${medico ? medico.nombre : 'N/A'}</td>
                    <td>${h.motivo}</td>
                    <td class="d-none d-lg-table-cell">${h.diagnostico}</td>
                    <td class="text-center">
                         <button class="btn btn-sm btn-outline-primary action-btn btn-view" data-id="${h.id}" title="Ver Detalles"><i class="bi bi-eye-fill"></i></button>
                         <button class="btn btn-sm btn-outline-danger action-btn btn-delete" data-id="${h.id}" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                    </td>
                </tr>
            `}).join('');
    };

    document.getElementById('btnNuevaConsulta').addEventListener('click', () => {
        document.getElementById('historialForm').reset();
        document.getElementById('historialId').value = '';
        document.getElementById('historialModalLabel').textContent = 'Nueva Consulta';
        // Llenar selects de pacientes y médicos
        populateSelect('historialPaciente', getFromStorage('pacientes').map(p => ({value: p.id, text: `${p.nombre} ${p.apellidos}`})));
        populateSelect('historialMedico', getFromStorage('users').filter(u => u.rol === 'doctor').map(m => ({value: m.id, text: m.nombre})));
        historialModal.show();
    });
    
    document.getElementById('historial-table-body').addEventListener('click', (e) => {
        const button = e.target.closest('button.action-btn');
        if (!button) return;
        const id = parseInt(button.dataset.id);
        const historial = getFromStorage('historial');
        const consulta = historial.find(h => h.id === id);

        if(button.classList.contains('btn-view')){
            document.getElementById('historialForm').reset();
            document.getElementById('historialId').value = consulta.id;
            document.getElementById('historialModalLabel').textContent = 'Detalles de Consulta';
            
            populateSelect('historialPaciente', getFromStorage('pacientes').map(p => ({value: p.id, text: `${p.nombre} ${p.apellidos}`})), consulta.pacienteId);
            populateSelect('historialMedico', getFromStorage('users').filter(u => u.rol === 'doctor').map(m => ({value: m.id, text: m.nombre})), consulta.medicoId);
            
            document.getElementById('historialFecha').value = consulta.fecha;
            document.getElementById('historialMotivo').value = consulta.motivo;
            document.getElementById('historialDiagnostico').value = consulta.diagnostico;
            document.getElementById('historialTratamiento').value = consulta.tratamiento;
            document.getElementById('historialNotas').value = consulta.notas;
            historialModal.show();
        }
        if(button.classList.contains('btn-delete')){
            if(confirm('¿Estás seguro de que deseas eliminar este registro del historial?')){
                let historialData = getFromStorage('historial');
                historialData = historialData.filter(h => h.id !== id);
                saveToStorage('historial', historialData);
                renderHistorialTable();
                showToast('Registro eliminado.', 'danger');
            }
        }
    });

    

    // ==================
    // SERVICIOS
    // ==================
    const renderServiciosTable = () => {
        const tbody = document.getElementById('servicios-table-body');
        const servicios = getFromStorage('servicios');
        tbody.innerHTML = servicios.map(s => `
            <tr>
                <td>${s.nombre}</td>
                <td>S/ ${parseFloat(s.precio).toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning action-btn btn-edit" data-id="${s.id}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger action-btn btn-delete" data-id="${s.id}" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `).join('');
    };
    document.getElementById('servicios-table-body').addEventListener('click', (e) => {
        const button = e.target.closest('button.action-btn');
        if (!button) return;
        const id = parseInt(button.dataset.id);
        
        if(button.classList.contains('btn-edit')){
            const servicios = getFromStorage('servicios');
            const servicio = servicios.find(s => s.id === id);
            document.getElementById('servicioId').value = servicio.id;
            document.getElementById('servicioModalLabel').textContent = 'Editar Servicio';
            document.getElementById('servicioNombre').value = servicio.nombre;
            document.getElementById('servicioPrecio').value = servicio.precio;
            servicioModal.show();
        }
        if(button.classList.contains('btn-delete')){
            if(confirm('¿Eliminar este servicio?')){
                let servicios = getFromStorage('servicios');
                servicios = servicios.filter(s => s.id !== id);
                saveToStorage('servicios', servicios);
                renderServiciosTable();
                showToast('Servicio eliminado.', 'danger');
            }
        }
    });

    // ==================
    // OFICINAS
    // ==================
    const renderOficinasTable = () => {
        const tbody = document.getElementById('oficinas-table-body');
        const oficinas = getFromStorage('oficinas');
        tbody.innerHTML = oficinas.map(o => `
            <tr>
                <td>${o.nombre}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning action-btn btn-edit" data-id="${o.id}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger action-btn btn-delete" data-id="${o.id}" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `).join('');
    };
    document.getElementById('oficinas-table-body').addEventListener('click', (e) => {
        const button = e.target.closest('button.action-btn');
        if (!button) return;
        const id = parseInt(button.dataset.id);
        
        if(button.classList.contains('btn-edit')){
            const oficinas = getFromStorage('oficinas');
            const oficina = oficinas.find(o => o.id === id);
            document.getElementById('oficinaId').value = oficina.id;
            document.getElementById('oficinaModalLabel').textContent = 'Editar Oficina';
            document.getElementById('oficinaNombre').value = oficina.nombre;
            oficinaModal.show();
        }
        if(button.classList.contains('btn-delete')){
            if(confirm('¿Eliminar esta oficina?')){
                let oficinas = getFromStorage('oficinas');
                oficinas = oficinas.filter(o => o.id !== id);
                saveToStorage('oficinas', oficinas);
                renderOficinasTable();
                showToast('Oficina eliminada.', 'danger');
            }
        }
    });

    // ==================
    // USUARIOS
    // ==================
    const renderUsuariosTable = () => {
        const tbody = document.getElementById('usuarios-table-body');
        const usuarios = getFromStorage('users');
        tbody.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.nombre}</td>
                <td>${u.username}</td>
                <td><span class="badge bg-info">${u.rol}</span></td>
                <td>${u.especialidad || '-'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning action-btn btn-edit" data-id="${u.id}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-outline-danger action-btn btn-delete" data-id="${u.id}" title="Eliminar" ${u.rol === 'admin' ? 'disabled' : ''}><i class="bi bi-trash-fill"></i></button>
                </td>
            </tr>
        `).join('');
    };
    document.getElementById('usuarios-table-body').addEventListener('click', (e) => {
        const button = e.target.closest('button.action-btn');
        if (!button) return;
        const id = parseInt(button.dataset.id);
        
        if(button.classList.contains('btn-edit')){
            const usuarios = getFromStorage('users');
            const usuario = usuarios.find(u => u.id === id);
            document.getElementById('usuarioId').value = usuario.id;
            document.getElementById('usuarioModalLabel').textContent = 'Editar Usuario';
            document.getElementById('usuarioNombre').value = usuario.nombre;
            document.getElementById('usuarioUsername').value = usuario.username;
            document.getElementById('usuarioRol').value = usuario.rol;
            document.getElementById('usuarioEspecialidad').value = usuario.especialidad;
            document.getElementById('usuarioPassword').value = ''; // La contraseña no se carga por seguridad
            usuarioModal.show();
        }
        if(button.classList.contains('btn-delete')){
            if(confirm('¿Eliminar este usuario?')){
                let usuarios = getFromStorage('users');
                usuarios = usuarios.filter(u => u.id !== id);
                saveToStorage('users', usuarios);
                renderUsuariosTable();
                showToast('Usuario eliminado.', 'danger');
            }
        }
    });


        // ==================
    // REPORTES
    // ==================
    function updateReports() {
        // Implementar lógica de reportes
        const citas = getFromStorage('citas');
        const servicios = getFromStorage('servicios');
        
        // Aquí puedes implementar la lógica para generar reportes
        console.log('Actualizando reportes...');
    }

    // --- INICIALIZACIÓN ---
    
    // Función auxiliar para poblar selects
    const populateSelect = (selectId, options, selectedValue = null) => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Seleccione...</option>';
        options.forEach(opt => {
            const option = new Option(opt.text, opt.value);
            select.add(option);
        });
        if(selectedValue) select.value = selectedValue;
    };

    // Intenta reanudar la sesión
    const savedUser = sessionStorage.getItem('loggedInUser');
    if (savedUser) {
        loggedInUser = JSON.parse(savedUser);
        showMainApp();
    }

    initData();

});