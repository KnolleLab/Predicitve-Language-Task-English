//
// Word prediction in STPD
//

// Data
data {
    // Dimensions
    int<lower=0> I; // Number of trials
    int<lower=0> L; // Number of participant-level linear predictors + 1

    
    // Trial-level predictors
    int pt[I]; // participant index
    vector[I] cloze_py;
    vector[I] correct;

    // Participant-level linear predictors
    vector[I] spq;
}

// Parameters
parameters {
  vector[2] gamma;
}

// Model
model {
    vector[I] lognu;
    vector[I] p_post;
    vector[I] beta;
    
    // Prior on gammas
    gamma ~ normal(0, 0.2);
    
    // Participant-level model for beta
    for (i in 1:I) {
        beta[i] = gamma[1] + gamma[2]*spq[i];
    }
    
    // Trial-level model for lognu
    for (i in 1:I) {
        lognu[i] = beta[i];
    }

    // Belief update model
    p_post = cloze_py + rep_vector(1, I)./(1 + exp(lognu)).*(correct - cloze_py);
    target += log(p_post);
}

