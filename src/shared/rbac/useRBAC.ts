import { useMemo } from 'react';
import { useAuth } from '@/shared/auth/AuthProvider';
import { Feature, FeatureTier, PATIENT_FEATURE_TIERS, ROLE_METADATA, RoleMetadata, canRole, getRolePermissions } from './permissions';
import { ConsentScope } from '@/shared/types/types';
import { CONSENT_SCOPE_FEATURES } from './permissions';

export interface RBACContext {
    /** Whether the current user has a specific feature permission */
    can: (feature: Feature) => boolean;
    /** Whether a feature is within the patient's or provider's consent-granted scope */
    canWithConsent: (feature: Feature, grantedScope: ConsentScope) => boolean;
    /** Whether a patient portal feature is Premium tier */
    isPremium: (featureKey: string) => boolean;
    /** The tier label for a patient portal route key */
    tier: (featureKey: string) => FeatureTier;
    /** Metadata about the current user's primary role */
    roleMetadata: RoleMetadata | null;
    /** Primary role string */
    primaryRole: string | null;
    /** All granted features */
    grantedFeatures: Feature[];
}

export function useRBAC(): RBACContext {
    const { user } = useAuth();

    return useMemo<RBACContext>(() => {
        // Determine primary role
        const primaryRole = user?.roles?.[0] ?? (user?.userType === 'PATIENT' ? 'patient' : null);
        const grantedFeatures = primaryRole ? getRolePermissions(primaryRole) : [];
        const roleMetadata = primaryRole ? (ROLE_METADATA[primaryRole] ?? null) : null;

        const can = (feature: Feature): boolean => {
            if (!primaryRole) return false;
            return canRole(primaryRole, feature);
        };

        const canWithConsent = (feature: Feature, grantedScope: ConsentScope): boolean => {
            // Must first pass role-level permission
            if (!can(feature)) return false;
            // Then must be within the consent scope
            const scopeFeatures = CONSENT_SCOPE_FEATURES[grantedScope] ?? [];
            return scopeFeatures.includes(feature);
        };

        const tier = (featureKey: string): FeatureTier => {
            return PATIENT_FEATURE_TIERS[featureKey] ?? 'standard';
        };

        const isPremium = (featureKey: string): boolean => {
            return tier(featureKey) === 'premium';
        };

        return {
            can,
            canWithConsent,
            isPremium,
            tier,
            roleMetadata,
            primaryRole,
            grantedFeatures,
        };
    }, [user]);
}
