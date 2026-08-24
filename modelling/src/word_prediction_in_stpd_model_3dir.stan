//
// Word prediction in STPD
//

// Data
data {
    // Dimensions
    int<lower=0> I; // Number of trials
    int<lower=0> K; // Number of trial-level linear predictors + 1
    int<lower=0> L; // Number of participant-level linear predictors + 1

    // Trial-level linear predictors
    vector[I] channels;
    vector[I] entropy;
    vector[I] cloze_pu;
    vector[I] clarity;
    
    // Other trial-level predictors
    int pt[I]; // participant index
    vector[I] cloze_py;
    vector[I] correct;

    // Participant-level linear predictors
    vector[I] spq;
}

// Parameters
parameters {
  vector[K] gamma[L];
}

// Model
model {
    vector[I] lognu;
    vector[I] post_py;
    vector[I] beta[K];
    
    // Prior on the gammas
    for (l in 1:L) {
        gamma[l] ~ normal(0, 0.2);
    }

     // Participant-level model for lognu
     for (k in 1:K) {
        for (i in 1:I) {
            beta[k,i] = gamma[1,k] + gamma[2,k]*spq[i];
        }
    }
    
    // Trial-level model for lognu
    for (i in 1:I) {
        lognu[i] = beta[1,i] + beta[2,i]*channels[i] + beta[3,i]*entropy[i] + beta[4,i]*cloze_pu[i] + beta[5,i]*clarity[i];
     }
    
    // Belief update model
    post_py = cloze_py + rep_vector(1, I)./(1 + exp(lognu)).*(correct - cloze_py);
    target += log(post_py);
}

