/**
 * Comunicação direta com os endpoints de autenticação do Back-end.
 */
class AuthApi {
    // Faz a requisição POST para o nosso AuthController no back-end
    async realizarLogin(email, password, userType) {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                email, 
                password, 
                tipo_usuario: userType 
            }),
        });

        const data = await response.json();

        // Se o back-end devolveu um status de erro (401, 403, 500), joga para o catch
        if (!response.ok) {
            throw new Error(data.erro || "Falha ao fazer login.");
        }

        // Se deu bom, devolve os dados
        return data;
    }

async realizarCadastroPersonal(nome, email, password, registro_profissional) {
    const response = await fetch("http://localhost:3000/personal-trainers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            nome, 
            email, 
            password, 
            registro_profissional 
        }),
    });

    const data = await response.json();

    // Se o back-end recusar o cadastro
    if (!response.ok) {
        throw new Error(data.erro || "Falha ao realizar o cadastro.");
    }

    return data;
}
}

// Exporta a instância para ser usada pelos Handlers
const authApi = new AuthApi();