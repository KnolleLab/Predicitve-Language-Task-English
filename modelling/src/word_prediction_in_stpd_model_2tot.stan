//
// Word prediction in STPD
//

// Data
data {
    // Dimensions
    int<lower=0> I; // Number of trials
    
    // Trial-level linear predictors of lognu
    vector[I] channels;
    vector[I] entropy;
    vector[I] cloze_pu;
    
    // Trial-level predictors in belief update model
    vector[I] cloze_py;
    vector[I] correct;
}

// Parameters
parameters {
  vector[4] beta;
}

// Model
model {
    vector[I] lognu;
    vector[I] p_post;

    // Prior on betas
    beta ~ normal(0, 0.2);

    // Linear model for lognu
    lognu = beta[1] + beta[2]*channels + beta[3]*entropy + beta[4]*cloze_pu;
    
    // Belief update model
    p_post = cloze_py + rep_vector(1, I)./(1 + exp(lognu)).*(correct - cloze_py);
    target += log(p_post);
}

