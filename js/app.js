let personas = [];
let clientes = [];

function buscarPersona(nombre, apellido) {
    return _.find(personas, { nombre, apellido });
}

function agregarPersona(nombre, apellido, edad) {
    personas.push({ nombre, apellido, edad });
}

function buscarCliente(nombre, apellido) {
    return _.find(clientes, { nombre, apellido });
}

function agregarCliente(nombre, apellido, edad) {
    clientes.push({ nombre, apellido, edad });
}

function pesosAeuros(pesos, tasaEuro) {
    return pesos / tasaEuro;
}

function eurosApesos(euros, tasaEuro) {
    return euros * tasaEuro;
}

function pesosAdolares(pesos, tasaDolar) {
    return pesos / tasaDolar;
}

function dolaresApesos(dolares, tasaDolar) {
    return dolares * tasaDolar;
}

function formatearDecimal(numero) {
    return numero.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function obtenerTasas() {
    const apiKey = '7cbe5e6da53c4678a1e428fe49b71105';
    try {
        let response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=USD,EUR,ARS`);
        let data = response.data.rates;
        let tasaDolar = data.ARS / data.USD;  
        let tasaEuro = data.ARS / data.EUR;   

        return { tasaDolar, tasaEuro };
    } catch (error) {
        console.error('Error al obtener tasas:', error);
        return { tasaDolar: 1, tasaEuro: 0.9161 };
    }
}

function mostrarResultadosConAnimacion(resultado) {
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = resultado;
    resultadosDiv.classList.add('show');
    setTimeout(() => {
        resultadosDiv.classList.remove('show');
    }, 10000);
}

function validarNombre() {
    let nombre = document.getElementById('nombre').value.trim();
    const mensaje = document.getElementById('nombre-error');
    if (/\d/.test(nombre)) {
        mensaje.textContent = 'El nombre no puede contener números.';
        mensaje.style.color = 'red';
    } else {
        mensaje.textContent = '';
    }
}

function validarApellido() {
    let apellido = document.getElementById('apellido').value.trim();
    const mensaje = document.getElementById('apellido-error');
    if (/\d/.test(apellido)) {
        mensaje.textContent = 'El apellido no puede contener números.';
        mensaje.style.color = 'red';
    } else {
        mensaje.textContent = '';
    }
}

function validarEdad() {
    let edad = parseInt(document.getElementById('edad').value.trim());
    const mensaje = document.getElementById('edad-error');
    if (isNaN(edad) || edad <= 0) {
        mensaje.textContent = 'La edad debe ser un número válido.';
        mensaje.style.color = 'red';
    } else {
        mensaje.textContent = '';
    }
}

function actualizarHistorial() {
    const historialLista = document.getElementById('historial-lista');
    historialLista.innerHTML = '';
    const historial = JSON.parse(localStorage.getItem('historial')) || [];
    _.sortBy(historial, 'fecha').reverse().forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `${item.fecha}: ${item.resultado} <button onclick="eliminarDelHistorial('${item.fecha}')">Eliminar</button>`;
        historialLista.appendChild(li);
    });
}

function agregarAHistorial(resultado) {
    const historial = JSON.parse(localStorage.getItem('historial')) || [];
    historial.push({ fecha: new Date().toISOString(), resultado });
    localStorage.setItem('historial', JSON.stringify(historial));
    actualizarHistorial();
}

function eliminarDelHistorial(fecha) {
    let historial = JSON.parse(localStorage.getItem('historial')) || [];
    historial = _.remove(historial, item => item.fecha !== fecha);
    localStorage.setItem('historial', JSON.stringify(historial));
    actualizarHistorial();
}

function filtrarPersonas(criterio) {
    return _.filter(personas, criterio);
}

function filtrarClientes(criterio) {
    return _.filter(clientes, criterio);
}

async function convertir() {
    let { tasaDolar, tasaEuro } = await obtenerTasas();
    let nombre = document.getElementById('nombre').value.trim();
    let apellido = document.getElementById('apellido').value.trim();
    let edad = parseInt(document.getElementById('edad').value.trim());
    let monto = parseFloat(document.getElementById('monto').value.trim());
    let opcion = document.getElementById('opcion').value;

    if (/\d/.test(nombre)) {
        alert('El nombre no puede contener números.');
        return;
    }
    if (/\d/.test(apellido)) {
        alert('El apellido no puede contener números.');
        return;
    }
    if (isNaN(edad) || edad <= 0) {
        alert('La edad debe ser un número válido.');
        return;
    }
    if (isNaN(monto) || monto <= 0) {
        alert('Por favor ingrese un monto válido.');
        return;
    }

    let persona = buscarPersona(nombre, apellido);
    if (!persona) {
        agregarPersona(nombre, apellido, edad);
    }
    let clienteExistente = buscarCliente(nombre, apellido);
    if (!clienteExistente) {
        agregarCliente(nombre, apellido, edad);
    }

    let resultado;
    if (opcion === '1') {
        let eurosConvertidos = pesosAeuros(monto, tasaEuro);
        let dolaresConvertidos = pesosAdolares(monto, tasaDolar);
        resultado = `${nombre} ${apellido}, ${edad} años, el equivalente en euros de $${formatearDecimal(monto)} pesos es ${formatearDecimal(eurosConvertidos)} EUR<br>
                     ${nombre} ${apellido}, ${edad} años, el equivalente en dólares de $${formatearDecimal(monto)} pesos es ${formatearDecimal(dolaresConvertidos)} USD`;
    } else if (opcion === '2') {
        let pesosDesdeEuros = eurosApesos(monto, tasaEuro);
        let pesosDesdeDolares = dolaresApesos(monto, tasaDolar);
        resultado = `${nombre} ${apellido}, ${edad} años, el equivalente en pesos desde ${formatearDecimal(monto)} EUR es $${formatearDecimal(pesosDesdeEuros)}<br>
        ${nombre} ${apellido}, ${edad} años, el equivalente en pesos desde ${formatearDecimal(monto)} USD es $${formatearDecimal(pesosDesdeDolares)}`;
    } else {
        alert('Opción no válida.');
        return;
    }

    mostrarResultadosConAnimacion(resultado);
    agregarAHistorial(resultado);

    personas = [];
    clientes = [];
}

function toggleDarkMode() {
    const body = document.body;
    const container = document.querySelector('.container');
    const toggleButton = document.getElementById('toggle-mode');
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        container.classList.remove('dark-mode');
        toggleButton.textContent = 'Cambiar a modo oscuro';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        container.classList.add('dark-mode');
        toggleButton.textContent = 'Cambiar a modo claro';
        localStorage.setItem('theme', 'dark');
    }
}

document.getElementById('convertir').addEventListener('click', convertir);
document.getElementById('nombre').addEventListener('input', validarNombre);
document.getElementById('apellido').addEventListener('input', validarApellido);
document.getElementById('edad').addEventListener('input', validarEdad);
document.getElementById('toggle-mode').addEventListener('click', toggleDarkMode);

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.container').classList.add('dark-mode');
        document.getElementById('toggle-mode').textContent = 'Cambiar a modo claro';
    }
    actualizarHistorial();
});
