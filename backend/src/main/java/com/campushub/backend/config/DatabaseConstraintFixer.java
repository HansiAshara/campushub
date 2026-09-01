package com.campushub.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConstraintFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraintFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            // Drop outdated check constraint on users table
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            // Migrate any existing users with MODULE_REP role to MODULE_COORDINATOR
            jdbcTemplate.execute("UPDATE users SET role = 'MODULE_COORDINATOR' WHERE role = 'MODULE_REP'");
            // Recreate check constraint with all valid User.Role enum values
            jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT', 'BATCH_LEADER', 'MODULE_COORDINATOR', 'ADMIN'))");
        } catch (Exception e) {
            System.err.println("Warning: Could not update users_role_check constraint: " + e.getMessage());
        }

        try {
            // Ensure resources table check constraint is also up to date
            jdbcTemplate.execute("ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_resource_type_check");
            jdbcTemplate.execute("ALTER TABLE resources ADD CONSTRAINT resources_resource_type_check CHECK (resource_type IN ('PAST_PAPER', 'TUTE', 'KUPPI_NOTES', 'SLIDES', 'NOTES'))");
        } catch (Exception e) {
            System.err.println("Warning: Could not update resources_resource_type_check constraint: " + e.getMessage());
        }
    }
}
